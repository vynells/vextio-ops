import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { isAuthorizedRequest } from "@/lib/auth";
import { resend, statusEmailContent, buildStatusEmailHtml } from "@/lib/resend";

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"];
const EMAIL_NOTIFY_STATUSES = ["cancelled", "returned"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rows } = await sql`SELECT * FROM orders WHERE id = ${id}`;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { rows } = await sql`
    SELECT order_number, contact, first_name, status AS current_status, items
    FROM orders WHERE id = ${id}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const {
    order_number: orderNumber,
    contact,
    first_name: firstName,
    current_status: currentStatus,
    items,
  } = rows[0];

  await sql`
    UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}
  `;

  // Decrement stock only the first time an order moves from pending into processing
  // (COD orders already decrement stock immediately at checkout, so this only
  // applies to non-COD orders that were awaiting payment confirmation).
  if (currentStatus === "pending" && status === "processing") {
    for (const item of items as { id: string; size?: string; qty: number }[]) {
      if (!item.size) continue;
      try {
        const { rows: productRows } = await sql`SELECT sizes FROM products WHERE id = ${item.id}`;
        if (productRows.length === 0) continue;
        const currentSizes: Record<string, number> = productRows[0].sizes || {};
        const currentQty = currentSizes[item.size] ?? 0;
        const newQty = Math.max(0, currentQty - (item.qty || 1));
        const updatedSizes = { ...currentSizes, [item.size]: newQty };
        await sql`
          UPDATE products SET sizes = ${JSON.stringify(updatedSizes)}::jsonb WHERE id = ${item.id}
        `;
      } catch (stockErr) {
        console.error(`Failed to update stock for ${item.id} size ${item.size}:`, stockErr);
      }
    }
  }

  if (EMAIL_NOTIFY_STATUSES.includes(status) && contact && contact.includes("@")) {
    try {
      const { subject, heading, body } = statusEmailContent(status as "cancelled" | "returned", orderNumber, firstName);
      await resend.emails.send({
        from: "Vextio <orders@blackoutmc.xyz>",
        to: contact,
        subject,
        html: buildStatusEmailHtml(heading, body),
      });
    } catch (emailErr) {
      console.error("Failed to send status email:", emailErr);
    }
  }

  return NextResponse.json({ success: true });
}

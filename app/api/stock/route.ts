import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { isAuthorizedRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await sql`
    SELECT id, name, image_url, price, sizes
    FROM products
    ORDER BY name ASC
  `;
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, size, qty } = await req.json();
  if (!productId || !size || typeof qty !== "number") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { rows } = await sql`SELECT sizes FROM products WHERE id = ${productId}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const currentSizes = rows[0].sizes || {};
  const updatedSizes = { ...currentSizes, [size]: Math.max(0, qty) };

  await sql`
    UPDATE products SET sizes = ${JSON.stringify(updatedSizes)}::jsonb WHERE id = ${productId}
  `;

  return NextResponse.json({ success: true });
}

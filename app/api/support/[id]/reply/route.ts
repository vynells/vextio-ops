import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { isAuthorizedRequest } from "@/lib/auth";
import { resend } from "@/lib/resend";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { replyText } = await req.json();

  if (!replyText || typeof replyText !== "string" || !replyText.trim()) {
    return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
  }

  const { rows } = await sql`SELECT * FROM support_messages WHERE id = ${id}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const message = rows[0];

  try {
    await resend.emails.send({
      from: "Vextio Support <help@blackoutmc.xyz>",
      to: message.from_email,
      subject: `Re: ${message.subject || "Your message to Vextio"}`,
      text: replyText,
    });
  } catch (err) {
    console.error("Failed to send support reply:", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 502 });
  }

  await sql`
    UPDATE support_messages SET status = 'replied', replied_at = NOW() WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}

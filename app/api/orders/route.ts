import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { isAuthorizedRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

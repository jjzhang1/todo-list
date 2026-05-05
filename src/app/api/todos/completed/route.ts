import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const db = getDb();
  db.prepare("DELETE FROM todos WHERE completed = 1").run();
  return NextResponse.json({ success: true });
}

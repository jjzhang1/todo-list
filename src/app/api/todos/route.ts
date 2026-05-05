import { NextRequest, NextResponse } from "next/server";
import { getDb, rowToTodo } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM todos ORDER BY created_at DESC").all() as any[];
  return NextResponse.json(rows.map(rowToTodo));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const text = (body.text || "").trim();
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const now = Date.now();

  const db = getDb();
  db.prepare(
    "INSERT INTO todos (id, text, note, completed, created_at) VALUES (?, ?, ?, 0, ?)"
  ).run(id, text, "", now);

  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as any;
  return NextResponse.json(rowToTodo(row), { status: 201 });
}

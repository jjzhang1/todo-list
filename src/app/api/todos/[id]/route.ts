import { NextRequest, NextResponse } from "next/server";
import { getDb, rowToTodo } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const db = getDb();

  const existing = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as any;
  if (!existing) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (body.text !== undefined) {
    const text = (body.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "Text cannot be empty" }, { status: 400 });
    }
    updates.push("text = ?");
    values.push(text);
  }

  if (body.note !== undefined) {
    updates.push("note = ?");
    values.push(body.note);
  }

  if (body.completed !== undefined) {
    const completed = Boolean(body.completed);
    updates.push("completed = ?");
    values.push(completed ? 1 : 0);
    updates.push("completed_at = ?");
    values.push(completed ? Date.now() : null);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE todos SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  }

  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as any;
  return NextResponse.json(rowToTodo(row));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}

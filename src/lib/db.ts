import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "todos.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      completed_at INTEGER
    )
  `);

  db.pragma("journal_mode = WAL");

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export interface TodoRow {
  id: string;
  text: string;
  note: string;
  completed: number;
  created_at: number;
  completed_at: number | null;
}

export interface Todo {
  id: string;
  text: string;
  note: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    note: row.note,
    completed: row.completed === 1,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

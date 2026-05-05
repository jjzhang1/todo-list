"use client";

import { useState, useEffect, useCallback } from "react";

interface Todo {
  id: string;
  text: string;
  note: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load todos");
    }
  }, []);

  useEffect(() => {
    fetcher().then(() => setReady(true));
  }, [fetcher]);

  const add = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to add todo");
      const todo = await res.json();
      setTodos(p => [todo, ...p]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add todo");
    }
  }, []);

  const toggle = useCallback(async (id: string, current: boolean) => {
    setTodos(p => p.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !current ? Date.now() : undefined } : t));
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
    } catch {
      setTodos(p => p.map(t => t.id === id ? { ...t, completed: current, completedAt: current ? Date.now() : undefined } : t));
    }
  }, []);

  const del = useCallback(async (id: string) => {
    const prev = todos;
    setTodos(p => p.filter(t => t.id !== id));
    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
    } catch {
      setTodos(prev);
    }
  }, [todos]);

  const updateText = useCallback(async (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const prev = todos;
    setTodos(p => p.map(t => t.id === id ? { ...t, text: trimmed } : t));
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
    } catch {
      setTodos(prev);
    }
  }, [todos]);

  const updateNote = useCallback(async (id: string, note: string) => {
    const prev = todos;
    setTodos(p => p.map(t => t.id === id ? { ...t, note } : t));
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
    } catch {
      setTodos(prev);
    }
  }, [todos]);

  const clearCompleted = useCallback(async () => {
    const prev = todos;
    setTodos(p => p.filter(t => !t.completed));
    try {
      await fetch("/api/todos/completed", { method: "DELETE" });
    } catch {
      setTodos(prev);
    }
  }, [todos]);

  return { todos, ready, error, add, toggle, del, updateText, updateNote, clearCompleted };
}

export type { Todo };

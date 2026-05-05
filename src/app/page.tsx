"use client";

import { useState, useRef, useCallback } from "react";
import { useTodos } from "@/hooks/useTodos";
import type { Todo } from "@/hooks/useTodos";

type Filter = "all" | "active" | "completed";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("zh-CN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function TodoApp() {
  const { todos, ready, add, toggle, del, updateText, updateNote, clearCompleted } = useTodos();
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleAdd = useCallback(() => {
    add(input);
    setInput("");
    inputRef.current?.focus();
  }, [input, add]);

  const handleToggle = useCallback((id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    toggle(id, todo.completed);
    if (!todo.completed) {
      const el = listRef.current?.querySelector(`[data-id="${id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const particles = Array.from({ length: 8 }, (_, i) => ({
          id: Date.now() + i,
          x: cx,
          y: cy,
        }));
        setConfetti(particles);
        setTimeout(() => setConfetti([]), 1000);
      }
    }
  }, [todos, toggle]);

  const handleDelete = useCallback((id: string) => {
    del(id);
  }, [del]);

  const startEdit = useCallback((t: Todo) => { setEditId(t.id); setEditText(t.text); }, []);
  const saveEdit = useCallback(() => {
    if (!editId) return;
    updateText(editId, editText);
    setEditId(null);
  }, [editId, editText, updateText]);

  const openNote = useCallback((t: Todo) => { setNoteId(t.id); setNoteText(t.note); }, []);
  const saveNote = useCallback(() => {
    if (!noteId) return;
    updateNote(noteId, noteText);
    setNoteId(null);
  }, [noteId, noteText, updateNote]);

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const active = todos.filter(t => !t.completed).length;
  const done = todos.filter(t => t.completed).length;
  const total = todos.length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const noteTodo = noteId ? todos.find(t => t.id === noteId) : null;

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg relative overflow-hidden">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />
      </div>

      {/* Confetti particles */}
      {confetti.map(c => (
        <div key={c.id} className="confetti" style={{ left: c.x, top: c.y, background: ["#7c3aed","#06b6d4","#10b981","#f59e0b","#f43f5e"][c.id % 5] }} />
      ))}

      {/* Main content - PC: centered card, Mobile: full width */}
      <div className="relative z-10 flex-1 flex flex-col md:items-center md:justify-center md:py-8">
        <div className="w-full md:max-w-2xl md:glass-card md:rounded-2xl md:p-8 flex flex-col md:min-h-[700px] md:max-h-[85vh]">
          {/* Header */}
          <header className="px-5 md:px-0 pt-14 md:pt-0 pb-6 md:pb-6 animate-slide-down">
            <div className="flex items-center gap-3">
              {/* Logo icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center animate-float-slow shadow-lg shadow-accent-glow">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text tracking-tight">Todo Flow</h1>
                <p className="text-text-muted text-xs md:text-sm mt-0.5">
                  {total === 0 ? "开始你的高效之旅" : `${active} 待办 · ${done} 完成`}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {total > 0 && (
              <div className="mt-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-text-muted text-xs">完成进度</span>
                  <span className="text-accent-light text-xs font-mono">{Math.round(progress)}%</span>
                </div>
                <div className="progress-track h-2">
                  <div className="progress-fill h-2" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </header>

          {/* Input */}
          <div className="px-5 md:px-0 pb-5 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  placeholder="添加新的待办事项..."
                  className="w-full neon-input rounded-xl px-4 py-3 md:py-3.5 text-text placeholder:text-text-muted/50 outline-none text-[15px]"
                />
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent/30 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent/30 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                {input && (
                  <button onClick={() => setInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                )}
              </div>
              <button onClick={handleAdd} disabled={!input.trim()} className="neon-btn rounded-xl px-5 py-3 md:py-3.5 text-white font-medium flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <span className="hidden md:inline text-sm">添加</span>
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="px-5 md:px-0 pb-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex gap-2 bg-surface rounded-xl p-1.5">
              {(["all", "active", "completed"] as Filter[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`filter-pill flex-1 py-2 rounded-lg text-sm font-medium ${filter === f ? "active" : "text-text-muted"}`}
                >
                  {f === "all" ? "全部" : f === "active" ? "待办" : "完成"}
                  {f === "active" && active > 0 && <span className="ml-1 text-xs opacity-60">{active}</span>}
                  {f === "completed" && done > 0 && <span className="ml-1 text-xs opacity-60">{done}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Stats cards - PC only */}
          <div className="hidden md:flex gap-3 pb-3 animate-slide-up" style={{ animationDelay: "250ms" }}>
            <div className="stat-glow flex-1 bg-surface rounded-xl p-3 border border-border">
              <div className="text-text-muted text-xs">待办事项</div>
              <div className="text-2xl font-bold text-accent-light font-mono mt-1">{active}</div>
            </div>
            <div className="stat-glow flex-1 bg-surface rounded-xl p-3 border border-border">
              <div className="text-text-muted text-xs">已完成</div>
              <div className="text-2xl font-bold text-green font-mono mt-1">{done}</div>
            </div>
            <div className="stat-glow flex-1 bg-surface rounded-xl p-3 border border-border">
              <div className="text-text-muted text-xs">总计</div>
              <div className="text-2xl font-bold text-cyan font-mono mt-1">{total}</div>
            </div>
          </div>

          {/* List */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-5 md:px-0 pb-20 md:pb-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                <div className="empty-icon text-6xl mb-4">
                  {filter === "completed" ? "🎯" : "✨"}
                </div>
                <p className="text-text-dim text-sm font-medium">
                  {filter === "completed" ? "还没有完成的待办" : filter === "active" ? "全部完成，太棒了！" : "添加你的第一个待办"}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  {filter === "completed" ? "完成待办后会在这里显示" : filter === "active" ? "享受无待办的轻松时刻" : "按回车或点击添加按钮"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 stagger">
                {filtered.map(todo => (
                  <div key={todo.id} data-id={todo.id}>
                    <div className={`todo-item glass-card rounded-xl p-4 md:p-5 relative ${todo.completed ? "completed" : ""}`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Checkbox */}
                        <button onClick={() => handleToggle(todo.id)}
                          className={`todo-check mt-1 md:mt-1.5 flex items-center justify-center ${todo.completed ? "checked" : ""}`}
                        >
                          {todo.completed && (
                            <svg className="check-svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {editId === todo.id ? (
                            <div className="flex items-center gap-2">
                              <input ref={editRef} value={editText} onChange={e => setEditText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditId(null); }}
                                onBlur={saveEdit}
                                className="w-full bg-transparent text-text outline-none text-[15px] border-b-2 border-accent pb-0.5" />
                            </div>
                          ) : (
                            <p className="todo-text text-base md:text-lg leading-relaxed break-words" onDoubleClick={() => startEdit(todo)}>
                              {todo.text}
                            </p>
                          )}

                          {todo.note && editId !== todo.id && (
                            <p className="todo-note-preview text-text-muted text-xs md:text-sm mt-1.5 line-clamp-1">
                              {todo.note}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-text-muted/50 text-[10px] md:text-xs font-mono">{formatDate(todo.createdAt)}</span>
                            {todo.completed && todo.completedAt && (
                              <span className="text-green/60 text-[10px] md:text-xs font-mono">✓ {formatDate(todo.completedAt)}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                          <button onClick={() => openNote(todo)}
                            className={`p-1.5 md:p-2 rounded-lg transition-all ${todo.note ? "text-accent-light hover:bg-accent-subtle" : "text-text-muted hover:text-text-dim hover:bg-surface-3"}`}
                            title="备注">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M10 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6l-3-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 2v4h3M6 9h4M6 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button onClick={() => startEdit(todo)}
                            className="p-1.5 md:p-2 rounded-lg text-text-muted hover:text-text-dim hover:bg-surface-3 transition-all" title="编辑">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {/* PC: inline delete button */}
                          <button onClick={() => handleDelete(todo.id)}
                            className="p-1.5 md:p-2 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-all" title="删除">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M7 7v4M9 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom bar - mobile */}
          {done > 0 && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-20">
              <div className="glass-card border-t border-border px-5 py-3 flex items-center justify-between animate-slide-up">
                <span className="text-text-muted text-xs">{done} 项已完成</span>
                <button onClick={() => clearCompleted()}
                  className="text-red text-xs font-medium hover:text-red/80 transition-colors active:scale-95">
                  清除已完成
                </button>
              </div>
            </div>
          )}

          {/* Bottom bar - PC */}
          {done > 0 && (
            <div className="hidden md:flex items-center justify-between pt-3 animate-fade-in">
              <span className="text-text-muted text-sm">{done} 项已完成</span>
              <button onClick={() => clearCompleted()}
                className="neon-btn !bg-gradient-to-r from-red to-red/80 rounded-lg px-4 py-2 text-white text-sm font-medium">
                清除已完成
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Note modal */}
      {noteId && noteTodo && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop"
          onClick={e => { if (e.target === e.currentTarget) saveNote(); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full md:max-w-lg modal-sheet">
            <div className="bg-surface-2 border border-border md:rounded-2xl rounded-t-2xl p-5 md:p-6 pb-8">
              {/* Mobile handle */}
              <div className="md:hidden w-10 h-1 bg-text-muted/30 rounded-full mx-auto mb-4" />
              <h3 className="text-text font-semibold text-lg mb-1">备注</h3>
              <p className="text-text-dim text-sm mb-4 line-clamp-1">{noteTodo.text}</p>
              <textarea ref={noteRef} value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="写下你的备注..."
                rows={5}
                className="w-full neon-input rounded-xl px-4 py-3 text-text placeholder:text-text-muted/50 outline-none text-sm resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setNoteId(null)}
                  className="flex-1 py-2.5 rounded-xl text-text-dim bg-surface-3 font-medium text-sm transition-all hover:bg-surface-3/80 active:scale-95">
                  取消
                </button>
                <button onClick={saveNote}
                  className="flex-1 neon-btn rounded-xl py-2.5 text-white font-medium text-sm">
                  保存备注
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

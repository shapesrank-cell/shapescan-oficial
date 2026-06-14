import { useState } from 'react';
import type { Task } from '../../types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput('');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
          : t
      )
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col gap-5 p-5 pt-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-colibri-text">Suas tarefas</h2>
        {completedCount > 0 && (
          <p className="text-sm text-colibri-success mt-1">
            Voce completou {completedCount} tarefa{completedCount > 1 ? 's' : ''} hoje!
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="O que quer fazer?"
          className="flex-1 min-h-touch px-4 py-3 rounded-2xl bg-colibri-surface border border-colibri-subtle/30 text-colibri-text placeholder-colibri-text-muted focus:outline-none focus:border-colibri-primary/50"
        />
        <button
          onClick={addTask}
          className="min-h-touch min-w-touch rounded-2xl bg-colibri-primary text-white font-medium px-4 transition-colors hover:bg-colibri-primary-light"
        >
          +
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">🌿</span>
            <p className="text-colibri-text-secondary mt-3 text-sm">
              Nada pendente — ou talvez voce so nao escreveu ainda. Ta tudo certo
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`
                flex items-center gap-3 min-h-touch px-4 py-3 rounded-2xl text-left
                transition-all duration-150
                ${task.completed
                  ? 'bg-colibri-success/10 border border-colibri-success/20'
                  : 'bg-colibri-surface border border-colibri-subtle/30 hover:bg-colibri-subtle'
                }
              `}
            >
              <span className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                transition-colors
                ${task.completed
                  ? 'bg-colibri-success border-colibri-success text-colibri-bg'
                  : 'border-colibri-text-muted'
                }
              `}>
                {task.completed && '✓'}
              </span>
              <span className={`text-base ${task.completed ? 'line-through text-colibri-text-muted' : 'text-colibri-text'}`}>
                {task.text}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

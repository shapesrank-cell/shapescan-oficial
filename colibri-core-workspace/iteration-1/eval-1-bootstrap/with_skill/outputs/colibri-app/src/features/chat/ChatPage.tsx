import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Oi! Eu sou o Colibri. To aqui pra te ouvir e ajudar no que precisar. Como voce ta?',
    sender: 'ai',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
    };

    const aiMsg: Message = {
      id: crypto.randomUUID(),
      text: 'Entendi! Obrigado por compartilhar. Lembre que cada passo conta, no seu ritmo.',
      sender: 'ai',
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`
              max-w-[80%] px-4 py-3 rounded-2xl text-sm
              ${msg.sender === 'user'
                ? 'bg-colibri-primary text-white self-end rounded-br-md'
                : 'bg-colibri-surface text-colibri-text self-start rounded-bl-md'
              }
            `}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-colibri-subtle/50 bg-colibri-bg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite algo..."
            className="flex-1 min-h-touch px-4 py-3 rounded-2xl bg-colibri-surface border border-colibri-subtle/30 text-colibri-text placeholder-colibri-text-muted focus:outline-none focus:border-colibri-primary/50"
          />
          <button
            onClick={sendMessage}
            className="min-h-touch min-w-touch rounded-2xl bg-colibri-primary text-white font-medium px-4 transition-colors hover:bg-colibri-primary-light"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

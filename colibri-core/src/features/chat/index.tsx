const mensagens = [
  { role: 'user',      texto: 'Estou com dificuldade de começar hoje.' },
  { role: 'assistant', texto: 'Tudo bem. Começar é a parte mais difícil. Que tal fazermos juntos só a primeira tarefa? Escolha uma pequenininha.' },
  { role: 'user',      texto: 'Ok, vou revisar meus e-mails por 10 minutos.' },
  { role: 'assistant', texto: 'Perfeito. 10 minutos é suficiente. Vou iniciar o timer para você quando quiser.' },
] as const

export default function ChatPage() {
  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile pt-stack-gap-md pb-32 flex flex-col">
      <section className="mb-stack-gap-lg">
        <h1 className="font-headline text-headline-xl text-primary mb-2">Colibri</h1>
        <p className="font-body text-body-md text-secondary">
          Seu companheiro gentil de foco.
        </p>
      </section>

      {/* Histórico de mensagens */}
      <div className="flex flex-col gap-stack-gap-sm flex-1">
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 font-body text-body-md leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-on-primary rounded-tl-lg rounded-bl-lg rounded-br-lg rounded-tr-sm'
                  : 'bg-surface-container-lowest text-on-surface soft-shadow rounded-tr-lg rounded-br-lg rounded-bl-lg rounded-tl-sm'
              }`}
            >
              {m.texto}
            </div>
          </div>
        ))}
      </div>

      {/* Input fixo */}
      <div className="fixed bottom-28 left-0 right-0 px-container-padding-mobile">
        <div className="max-w-[800px] mx-auto flex items-center gap-3 bg-surface-container-lowest rounded-full px-5 py-3 soft-shadow border border-outline-variant/20">
          <input
            type="text"
            placeholder="Como posso ajudar agora?"
            className="flex-1 bg-transparent font-body text-body-md text-on-surface placeholder:text-outline outline-none"
          />
          <button
            aria-label="Enviar"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  )
}

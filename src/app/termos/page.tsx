import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do ShapeScan.",
};

export default function TermosPage() {
  return (
    <div className="flex-1 bg-[#111111] px-5 py-12 sm:py-20">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <Link
          href="/"
          className="text-sm text-white/50 hover:text-white/80 transition-colors self-start"
        >
          ← Voltar
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            <span className="text-orange-400">Termos</span> de Uso
          </h1>
          <p className="text-sm text-white/40">
            Última atualização: maio de 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none flex flex-col gap-6 text-white/70">
          <Secao titulo="1. Aceitação dos Termos">
            <p>
              Ao criar uma conta e usar o ShapeScan (&quot;Serviço&quot;), você concorda
              integralmente com estes Termos de Uso e com a Política de Privacidade.
              Se você não concorda com qualquer parte destes termos, não utilize o
              Serviço.
            </p>
          </Secao>

          <Secao titulo="2. Sobre o Serviço">
            <p>
              O ShapeScan é uma plataforma de análise corporal assistida por
              inteligência artificial (Google Gemini). O Serviço gera estimativas
              de biotipo, sugestões alimentares e planos de treino com base nos
              dados informados pelo usuário.
            </p>
            <p>
              <strong className="text-orange-400">
                O Serviço NÃO substitui acompanhamento profissional.
              </strong>{" "}
              As recomendações são geradas por IA e têm caráter informativo e
              educacional. Decisões sobre dieta, treino ou saúde devem sempre ser
              tomadas com orientação de profissionais qualificados (médico,
              nutricionista, educador físico).
            </p>
          </Secao>

          <Secao titulo="3. Conta de Usuário">
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Você é responsável por manter a confidencialidade da sua senha.</li>
              <li>Você é responsável por toda atividade na sua conta.</li>
              <li>
                Você deve fornecer informações verdadeiras durante o cadastro.
              </li>
              <li>
                É proibido criar contas em nome de terceiros sem autorização.
              </li>
              <li>Idade mínima para uso: 14 anos.</li>
            </ul>
          </Secao>

          <Secao titulo="4. Uso Permitido">
            <p>É proibido:</p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                Usar o Serviço para fins ilegais, fraudulentos ou prejudiciais.
              </li>
              <li>
                Tentar burlar mecanismos de segurança, rate limit ou autenticação.
              </li>
              <li>
                Fazer engenharia reversa, copiar ou redistribuir o Serviço.
              </li>
              <li>
                Enviar conteúdo ofensivo, ilegal ou que viole direitos de terceiros.
              </li>
              <li>Usar bots ou ferramentas automatizadas sem autorização.</li>
            </ul>
          </Secao>

          <Secao titulo="5. Conteúdo Gerado pela IA">
            <p>
              As análises geradas pelo ShapeScan são produzidas por modelos de
              inteligência artificial e podem conter imprecisões. Não nos
              responsabilizamos por decisões tomadas exclusivamente com base no
              conteúdo gerado.
            </p>
            <p>
              Você é o proprietário do conteúdo das suas análises e pode exportar
              ou excluir esses dados a qualquer momento.
            </p>
          </Secao>

          <Secao titulo="6. Limitação de Responsabilidade">
            <p>
              O Serviço é fornecido &quot;como está&quot;, sem garantias de qualquer tipo.
              Não nos responsabilizamos por:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Decisões médicas ou nutricionais tomadas com base nas análises.</li>
              <li>Consequências físicas decorrentes da aplicação das sugestões.</li>
              <li>Indisponibilidade temporária do Serviço.</li>
              <li>Perda de dados causada por força maior ou ataque malicioso.</li>
            </ul>
          </Secao>

          <Secao titulo="7. Modificações">
            <p>
              Podemos modificar estes Termos a qualquer momento. Modificações
              relevantes serão comunicadas por email ou notificação no Serviço.
              O uso continuado após mudanças constitui aceitação dos novos termos.
            </p>
          </Secao>

          <Secao titulo="8. Encerramento">
            <p>
              Você pode encerrar sua conta a qualquer momento em /configurações.
              Reservamo-nos o direito de suspender ou encerrar contas que violem
              estes Termos.
            </p>
          </Secao>

          <Secao titulo="9. Lei Aplicável">
            <p>
              Estes Termos são regidos pelas leis da República Federativa do
              Brasil. Foro eleito: comarca da residência do usuário (CDC).
            </p>
          </Secao>

          <Secao titulo="10. Contato">
            <p>
              Para dúvidas, entre em contato pelo email:{" "}
              <a
                href="mailto:contato@shapescan.app"
                className="text-orange-400 hover:underline"
              >
                contato@shapescan.app
              </a>
            </p>
          </Secao>
        </div>

        <div className="pt-8 border-t border-white/[0.08]">
          <Link
            href="/privacidade"
            className="text-orange-400 hover:underline text-sm"
          >
            Ver Política de Privacidade →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl sm:text-2xl font-bold text-white">{titulo}</h2>
      <div className="flex flex-col gap-3 text-sm sm:text-base leading-relaxed text-white/70">
        {children}
      </div>
    </section>
  );
}

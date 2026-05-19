import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — ShapeScan",
  description: "Como tratamos seus dados no ShapeScan",
};

export default function PrivacidadePage() {
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
            Política de <span className="text-orange-400">Privacidade</span>
          </h1>
          <p className="text-sm text-white/40">
            Última atualização: maio de 2026 • Em conformidade com LGPD (Lei
            13.709/2018)
          </p>
        </div>

        <div className="flex flex-col gap-6 text-white/70">
          <Secao titulo="1. Quais dados coletamos">
            <p>
              <strong className="text-white">Dados de cadastro:</strong> nome,
              email, senha (armazenada como hash seguro).
            </p>
            <p>
              <strong className="text-white">Dados de análise:</strong> sexo,
              idade, peso, altura, nível de atividade, objetivo.
            </p>
            <p>
              <strong className="text-white">Foto opcional:</strong> se enviada,
              é processada pela IA para refinar a análise. <strong>A foto NÃO é
              armazenada no banco</strong> — apenas o resultado da análise gerado a
              partir dela.
            </p>
            <p>
              <strong className="text-white">Dados técnicos:</strong> endereço
              IP, navegador, sistema operacional (para segurança e analytics
              agregados).
            </p>
          </Secao>

          <Secao titulo="2. Como usamos seus dados">
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Gerar análises personalizadas via inteligência artificial.</li>
              <li>Manter histórico de análises na sua conta.</li>
              <li>Garantir segurança da plataforma (rate limit, auditoria).</li>
              <li>Melhorar o Serviço com métricas agregadas e anonimizadas.</li>
            </ul>
            <p>
              <strong className="text-orange-400">
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com
                terceiros para fins comerciais.
              </strong>
            </p>
          </Secao>

          <Secao titulo="3. Com quem compartilhamos">
            <p>Compartilhamos dados apenas com processadores essenciais:</p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>Google (Gemini API):</strong> processa os dados de entrada
                e a foto opcional para gerar a análise. Dados não são usados para
                treinar modelos. Política:{" "}
                <a
                  href="https://ai.google.dev/gemini-api/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 hover:underline"
                >
                  Google AI Terms
                </a>
              </li>
              <li>
                <strong>Supabase:</strong> hospedagem do banco de dados e
                autenticação. Servidores em São Paulo (AWS Brasil).
              </li>
              <li>
                <strong>Vercel:</strong> hospedagem da aplicação. CDN global.
              </li>
            </ul>
          </Secao>

          <Secao titulo="4. Seus direitos (LGPD)">
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>Acessar:</strong> ver todos os dados que temos sobre você
                em /perfil e /configurações.
              </li>
              <li>
                <strong>Corrigir:</strong> atualizar nome e dados em /perfil.
              </li>
              <li>
                <strong>Exportar:</strong> baixar todos seus dados em JSON em
                /configurações.
              </li>
              <li>
                <strong>Deletar:</strong> remover sua conta e todos os dados em
                /configurações. Ação permanente e irreversível.
              </li>
              <li>
                <strong>Revogar consentimento:</strong> a qualquer momento,
                deletando sua conta.
              </li>
            </ul>
          </Secao>

          <Secao titulo="5. Retenção de dados">
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Após deleção
              da conta:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Perfil e análises: removidos imediatamente.</li>
              <li>
                Logs técnicos (audit log, error log): mantidos por 90 dias para
                obrigações legais e segurança, depois anonimizados.
              </li>
            </ul>
          </Secao>

          <Secao titulo="6. Segurança">
            <p>
              Aplicamos medidas técnicas razoáveis para proteger seus dados:
              criptografia em trânsito (HTTPS/TLS), senhas armazenadas como hash,
              Row Level Security (RLS) no banco, rate limiting contra abuso, log
              de auditoria de ações administrativas.
            </p>
            <p>
              Nenhum sistema é 100% seguro. Em caso de incidente, notificaremos a
              ANPD e os usuários afetados conforme prazos legais.
            </p>
          </Secao>

          <Secao titulo="7. Cookies">
            <p>
              Usamos cookies essenciais para autenticação e sessão. Não usamos
              cookies de rastreamento publicitário ou de terceiros para
              marketing.
            </p>
          </Secao>

          <Secao titulo="8. Crianças">
            <p>
              O Serviço é destinado a maiores de 14 anos. Não coletamos
              intencionalmente dados de menores de 14 anos. Se tomarmos
              conhecimento, deletaremos imediatamente.
            </p>
          </Secao>

          <Secao titulo="9. Mudanças nesta política">
            <p>
              Podemos atualizar esta política. Mudanças significativas serão
              comunicadas por email ou notificação no app. A data de atualização
              acima reflete a versão vigente.
            </p>
          </Secao>

          <Secao titulo="10. Encarregado de Dados (DPO) e contato">
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade,
              entre em contato:{" "}
              <a
                href="mailto:privacidade@shapescan.app"
                className="text-orange-400 hover:underline"
              >
                privacidade@shapescan.app
              </a>
            </p>
            <p>
              Você também pode reclamar à Autoridade Nacional de Proteção de
              Dados (ANPD) em{" "}
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:underline"
              >
                gov.br/anpd
              </a>
              .
            </p>
          </Secao>
        </div>

        <div className="pt-8 border-t border-white/[0.08]">
          <Link
            href="/termos"
            className="text-orange-400 hover:underline text-sm"
          >
            Ver Termos de Uso →
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

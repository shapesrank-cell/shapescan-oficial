/**
 * Casca dos setores logados: monta a navegação global (AppNav) e dá o
 * espaçamento certo pro conteúdo — offset da sidebar no desktop e folga
 * pra barra inferior no mobile.
 *
 * É um Server Component (só layout). O AppNav é que é client.
 */
import { AppNav } from "./AppNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <AppNav />
      {/* sm:pl-60 → abre espaço pra sidebar. pb-24 → folga pra barra inferior. */}
      <div className="flex flex-1 flex-col pb-24 sm:pb-0 sm:pl-60">
        {children}
      </div>
    </div>
  );
}

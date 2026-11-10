import Link from "next/link";
import type { ReactNode } from "react";
import NavMembros from "@/components/membros/NavMembros";
import { signOut } from "@/lib/auth-actions";
import { formatarDataCurta, type ContaContexto } from "@/lib/conta/contexto";

// Moldura da área de membros ("Edição do Assinante" — ver
// docs/membros/REDESIGN_AREA_MEMBROS.md): lombada escura de navegação +
// conteúdo em papel claro. Substitui o masthead público dentro de /conta.
export default function MembrosShell({
  contexto,
  children,
}: {
  contexto: ContaContexto | null;
  children: ReactNode;
}) {
  // Sem sessão a página faz o redirect para /entrar; até lá, nada de
  // navegação de membro (e nada de dado de usuário no HTML).
  if (!contexto) return <>{children}</>;

  return (
    <div className="m-shell">
      <a href="#m-conteudo" className="m-pular">
        Pular para o conteúdo
      </a>
      <NavMembros
        nome={contexto.nome}
        email={contexto.email}
        isPremium={contexto.isPremium}
        validade={contexto.premiumAte ? `Válido até ${formatarDataCurta(contexto.premiumAte)}` : null}
        sair={signOut}
      />
      <div className="m-area">
        <main id="m-conteudo" className="m-conteudo" tabIndex={-1}>
          {children}
        </main>
        <footer className="m-rodape">
          <span>© LotoAnalítica · Jogue com responsabilidade. Proibido para menores de 18 anos.</span>
          <nav aria-label="Links institucionais">
            <Link href="/dicas#jogo-responsavel">Jogo responsável</Link>
            <Link href="/termos">Termos</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/contato">Fale conosco</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}

// Cabeçalho padrão de página da área de membros.
export function CabecalhoPagina({
  titulo,
  descricao,
  voltar,
  acoes,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  voltar?: { href: string; rotulo: string };
  acoes?: ReactNode;
}) {
  return (
    <header className="m-cabecalho">
      <div className="m-cabecalho__textos">
        {voltar && (
          <Link href={voltar.href} className="m-cabecalho__voltar">
            <span aria-hidden>←</span> {voltar.rotulo}
          </Link>
        )}
        <h1 className="m-cabecalho__titulo">{titulo}</h1>
        {descricao && <p className="m-cabecalho__descricao">{descricao}</p>}
      </div>
      {acoes && <div className="m-cabecalho__acoes">{acoes}</div>}
    </header>
  );
}

// Abas entre páginas irmãs (ex.: Desempenho → Carteira | Meu ano).
export function AbasPagina({
  abas,
  ativa,
  rotulo,
}: {
  abas: { href: string; rotulo: string }[];
  ativa: string;
  rotulo: string;
}) {
  return (
    <nav className="m-abas" aria-label={rotulo}>
      {abas.map((a) => (
        <Link key={a.href} href={a.href} className="m-abas__aba" aria-current={a.href === ativa ? "page" : undefined}>
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}

// Recurso exclusivo de assinantes, mostrado a quem é free dentro da área.
// Informativo, sem tom de venda: uma frase e um link.
export function RecursoBloqueado({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="m-bloqueado" aria-label={`${titulo} (Premium)`}>
      <p className="m-bloqueado__selo">
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M12 2 22 12 12 22 2 12z" fill="currentColor" />
        </svg>
        Recurso Premium
      </p>
      <h2 className="m-bloqueado__titulo">{titulo}</h2>
      <p className="m-bloqueado__texto">{children}</p>
      <Link href="/premium" className="m-botao m-botao--secundario">
        Conhecer o Premium
      </Link>
    </section>
  );
}

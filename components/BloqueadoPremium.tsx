import Link from "next/link";

interface Props {
  titulo?: string;
  descricao: string;
  logado: boolean;
}

// Exibido no lugar de funcionalidades restritas a assinantes.
// Server Component — sem estado, renderizado no servidor.
export default function BloqueadoPremium({
  titulo = "Recurso Premium",
  descricao,
  logado,
}: Props) {
  return (
    <div className="bloqueado-premium">
      <div className="bloqueado-premium__icone">✦</div>
      <p className="bloqueado-premium__titulo">{titulo}</p>
      <p className="bloqueado-premium__desc">{descricao}</p>
      <div className="bloqueado-premium__acoes">
        <Link href="/assinar" className="botao-gerar bloqueado-premium__cta">
          Assinar Premium →
        </Link>
        {!logado && (
          <Link href="/entrar" className="bloqueado-premium__entrar">
            Já tenho uma conta
          </Link>
        )}
      </div>
    </div>
  );
}

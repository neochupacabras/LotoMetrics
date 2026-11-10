import MembrosShell from "@/components/membros/MembrosShell";
import { getContaContexto } from "@/lib/conta/contexto";
import "./membros.css";

// Layout da área de membros. Só desenha a moldura: a proteção de cada
// rota continua no proxy.ts (redirect para /entrar) e em cada página
// (getContaContexto() + redirect), e nas actions/rotas de API.
export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const contexto = await getContaContexto();
  return <MembrosShell contexto={contexto}>{children}</MembrosShell>;
}

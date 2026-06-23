import { getPlanoPremium } from "@/lib/plano";
import AnuncioDisplay from "./AnuncioDisplay";

interface Props {
  slot: string;
  formato?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

// Server Component — verifica o plano no servidor.
// Se o usuário for premium, não renderiza nada e o script do AdSense
// nunca é chamado. Se for free, renderiza o AnuncioDisplay (Client Component).
export default async function Anuncio({ slot, formato, className }: Props) {
  const { premium } = await getPlanoPremium();

  if (premium) return null;

  return <AnuncioDisplay slot={slot} formato={formato} className={className} />;
}

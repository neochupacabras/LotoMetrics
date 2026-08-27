import { breadcrumbJsonLd, type ItemTrilha } from "@/lib/seo";

// Renderiza o <script type="application/ld+json"> de BreadcrumbList pra
// uma página — não afeta nada visualmente, só o que o Google enxerga.
export default function BreadcrumbJsonLd({ itens }: { itens: ItemTrilha[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(itens)) }}
    />
  );
}

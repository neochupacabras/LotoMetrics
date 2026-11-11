import { formatarDezena } from "@/lib/format";

export default function Dezenas({
  dezenas,
  tamanho = "normal",
  wrapperClassName = "dezenas",
}: {
  dezenas: number[];
  tamanho?: "normal" | "pequena";
  wrapperClassName?: string;
}) {
  return (
    <div className={wrapperClassName}>
      {/* key com a posição: no Super Sete o mesmo dígito aparece em
          colunas diferentes, e key={d} gerava chaves duplicadas. */}
      {dezenas.map((d, i) => (
        <span
          key={`${i}-${d}`}
          className={tamanho === "pequena" ? "dezena-bola dezena-bola--pequena" : "dezena-bola"}
          style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
        >
          {formatarDezena(d)}
        </span>
      ))}
    </div>
  );
}

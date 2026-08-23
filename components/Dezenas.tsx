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
      {dezenas.map((d, i) => (
        <span
          key={d}
          className={tamanho === "pequena" ? "dezena-bola dezena-bola--pequena" : "dezena-bola"}
          style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
        >
          {formatarDezena(d)}
        </span>
      ))}
    </div>
  );
}

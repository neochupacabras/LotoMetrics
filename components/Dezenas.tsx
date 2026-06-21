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
      {dezenas.map((d) => (
        <span
          key={d}
          className={tamanho === "pequena" ? "dezena-bola dezena-bola--pequena" : "dezena-bola"}
        >
          {formatarDezena(d)}
        </span>
      ))}
    </div>
  );
}

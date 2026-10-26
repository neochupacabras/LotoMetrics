"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { excluirBilheteAction } from "@/lib/bolao-bilhete-actions";
import "./bilhete-upload.css";

interface Foto {
  id: string;
  url: string | null;
  jogosEncontrados: number;
}

interface Props {
  bolaoId: string;
  totalJogos: number;
  jogosVerificados: number;
  fotos: Foto[];
  ehPro: boolean;
  limiteFotos: number;
}

const LADO_MAXIMO = 1600;

// Reduz a foto no navegador antes de enviar: a Vercel limita o corpo da
// requisição a 4,5 MB e uma foto de celular passa disso fácil. JPEG com
// lado maior de 1600px segue legível pro OCR e fica em poucas centenas de KB.
async function reduzirImagem(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("falha ao reduzir"))), "image/jpeg", 0.85)
  );
}

export default function BilheteUpload({ bolaoId, totalJogos, jogosVerificados, fotos, ehPro, limiteFotos }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setMensagem(null);
    setEnviando(true);
    try {
      const reduzida = await reduzirImagem(arquivo);
      const fd = new FormData();
      fd.set("bolaoId", bolaoId);
      fd.set("imagem", reduzida, "bilhete.jpg");
      const res = await fetch("/api/bolao/bilhete", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setMensagem({ tipo: "erro", texto: data.erro ?? "Não foi possível enviar a foto." });
      } else {
        setMensagem({
          tipo: data.aviso ? "erro" : "ok",
          texto: data.aviso ?? `Foto enviada: ${data.encontrados} de ${data.total} jogos conferem com ela.`,
        });
        router.refresh();
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível preparar a imagem. Tente outra foto." });
    } finally {
      setEnviando(false);
    }
  }

  async function remover(id: string) {
    setMensagem(null);
    const r = await excluirBilheteAction(bolaoId, id);
    if (r.ok) router.refresh();
    else setMensagem({ tipo: "erro", texto: r.erro ?? "Não foi possível remover." });
  }

  return (
    <div className="bilhete-upload">
      <p className="bloco__nota">
        {fotos.length === 0
          ? "Fotografe o bilhete depois de apostar: o grupo vê a foto na página do bolão e eu confiro quais jogos aparecem nela."
          : `${jogosVerificados} de ${totalJogos} jogos do bolão aparecem nas fotos enviadas.`}{" "}
        A foto fica visível para quem tiver o link do bolão — evite mostrar dados pessoais.
      </p>

      {ehPro ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="bilhete-upload__input"
            onChange={enviar}
            disabled={enviando || fotos.length >= limiteFotos}
            aria-label="Foto do bilhete"
          />
          <button
            type="button"
            className="botao-gerar"
            onClick={() => inputRef.current?.click()}
            disabled={enviando || fotos.length >= limiteFotos}
          >
            {enviando ? "Lendo o bilhete…" : fotos.length >= limiteFotos ? "Limite de fotos atingido" : "Enviar foto do bilhete"}
          </button>
        </>
      ) : (
        <p className="bloco__nota">Recurso do Bolão Pro: libere o Pro acima para enviar a foto do bilhete.</p>
      )}

      {mensagem && (
        <p className={mensagem.tipo === "ok" ? "auth-mensagem auth-mensagem--ok" : "gerador-erro"} role="status">
          {mensagem.texto}
        </p>
      )}

      {fotos.length > 0 && (
        <ul className="bilhete-upload__lista">
          {fotos.map((f) => (
            <li key={f.id} className="bilhete-upload__item">
              {f.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt="Foto do bilhete" className="bilhete-upload__foto" />
              ) : (
                <div className="bilhete-upload__foto bilhete-upload__foto--vazia">sem prévia</div>
              )}
              <span className="bloco__nota">{f.jogosEncontrados} jogos conferem</span>
              <button type="button" className="botao-copiar" onClick={() => remover(f.id)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

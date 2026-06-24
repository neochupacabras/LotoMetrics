"use client";

import { useState, useRef, useCallback } from "react";

interface ResultadoOCR {
  dezenas: number[];
  confianca: "alta" | "media" | "baixa";
  aviso: string | null;
  erro?: string;
}

interface Props {
  codigoLoteria: string;
  qtdDezenasSorteadas: number;
  isPremium: boolean;
  logado: boolean;
  onDezenasDetectadas: (dezenas: number[]) => void;
}

export default function ConferidorFoto({
  codigoLoteria,
  qtdDezenasSorteadas,
  isPremium,
  logado,
  onDezenasDetectadas,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoOCR | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleArquivo = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setArquivo(file);
    setResultado(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleArquivo(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleArquivo(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleProcessar() {
    if (!arquivo) return;
    setProcessando(true);
    setResultado(null);

    try {
      const fd = new FormData();
      fd.append("imagem", arquivo);
      fd.append("loteria", codigoLoteria);

      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const data: ResultadoOCR = await res.json();
      setResultado(data);

      if (!data.erro && data.dezenas.length > 0) {
        onDezenasDetectadas(data.dezenas);
      }
    } catch {
      setResultado({ dezenas: [], confianca: "baixa", aviso: null, erro: "Erro de conexão." });
    } finally {
      setProcessando(false);
    }
  }

  function handleLimpar() {
    setPreview(null);
    setArquivo(null);
    setResultado(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── Bloqueado para free ───────────────────────────────────────────────────
  if (!logado) {
    return (
      <div className="ocr-cta">
        <span className="ocr-cta__icone">📷</span>
        <p className="ocr-cta__titulo">Conferidor por foto</p>
        <p className="ocr-cta__desc">
          Fotografe o bilhete e as dezenas são preenchidas automaticamente.
          Recurso exclusivo para assinantes Premium.
        </p>
        <a href="/cadastrar" className="botao-gerar">Criar conta →</a>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="ocr-cta">
        <span className="ocr-cta__icone">📷</span>
        <p className="ocr-cta__titulo">Conferidor por foto ✦ Premium</p>
        <p className="ocr-cta__desc">
          Fotografe o bilhete e as dezenas são preenchidas automaticamente —
          sem digitar nada. Funciona mesmo com bilhetes amassados ou iluminação
          imperfeita.
        </p>
        <a href="/assinar" className="botao-gerar">Assinar Premium →</a>
      </div>
    );
  }

  // ── Interface de upload (Premium) ─────────────────────────────────────────
  return (
    <div className="ocr-wrapper">
      {!preview ? (
        // Área de drop / botão de upload
        <div
          className="ocr-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
        >
          <span className="ocr-dropzone__icone">📷</span>
          <p className="ocr-dropzone__titulo">Fotografe ou envie o bilhete</p>
          <p className="ocr-dropzone__sub">
            Arraste aqui, clique para selecionar, ou use a câmera no celular
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment" // abre câmera traseira no mobile
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
        </div>
      ) : (
        // Preview da imagem selecionada
        <div className="ocr-preview">
          <div className="ocr-preview__imagem-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview do bilhete"
              className="ocr-preview__imagem"
            />
          </div>

          {/* Resultado do OCR */}
          {resultado && (
            <div className={`ocr-resultado ocr-resultado--${resultado.confianca}`}>
              {resultado.erro ? (
                <p className="ocr-resultado__erro">{resultado.erro}</p>
              ) : (
                <>
                  <div className="ocr-resultado__header">
                    <span className={`ocr-resultado__badge ocr-resultado__badge--${resultado.confianca}`}>
                      {resultado.confianca === "alta" ? "✓ Leitura precisa" :
                       resultado.confianca === "media" ? "⚠ Leitura parcial" :
                       "✕ Leitura incerta"}
                    </span>
                    <span className="ocr-resultado__count">
                      {resultado.dezenas.length} de {qtdDezenasSorteadas} dezenas detectadas
                    </span>
                  </div>

                  <div className="ocr-resultado__dezenas">
                    {resultado.dezenas.map(d => (
                      <span key={d} className="ocr-resultado__dezena">
                        {String(d).padStart(2, "0")}
                      </span>
                    ))}
                  </div>

                  {resultado.aviso && (
                    <p className="ocr-resultado__aviso">{resultado.aviso}</p>
                  )}

                  {resultado.dezenas.length > 0 && resultado.confianca !== "baixa" && (
                    <p className="ocr-resultado__ok">
                      As dezenas foram preenchidas no conferidor abaixo. Verifique e confirme.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="ocr-acoes">
            {!resultado && (
              <button
                type="button"
                className="botao-gerar"
                onClick={handleProcessar}
                disabled={processando}
              >
                {processando ? (
                  <span className="ocr-processando">
                    <span className="ocr-spinner" />
                    Lendo bilhete…
                  </span>
                ) : (
                  "Ler dezenas →"
                )}
              </button>
            )}
            <button
              type="button"
              className="botao-copiar"
              onClick={handleLimpar}
            >
              {resultado ? "Usar outra foto" : "Cancelar"}
            </button>
          </div>
        </div>
      )}

      <p className="ocr-nota">
        A foto não é armazenada — ela é processada e descartada imediatamente.
      </p>
    </div>
  );
}

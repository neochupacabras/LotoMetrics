-- Foto do bilhete como comprovante do bolão (Fase 4).
--
-- Bucket PRIVADO: nenhum acesso pelo client (storage.objects tem RLS e não
-- criamos política nenhuma). Upload, leitura e exclusão são sempre feitos
-- pelo servidor (service role), depois de checar dono e plano; a página
-- pública recebe URLs assinadas de curta duração.
--
-- bolao_bilhetes guarda só metadados: o caminho no storage e quais jogos do
-- bolão (índices 0-based na ordem de bolao_jogos) foram encontrados no texto
-- lido da foto por OCR. O texto bruto do OCR NÃO é guardado.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bolao-bilhetes',
  'bolao-bilhetes',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.bolao_bilhetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bolao_id UUID NOT NULL REFERENCES public.boloes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  jogos_encontrados INTEGER[] NOT NULL DEFAULT '{}',
  numeros_lidos INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bolao_bilhetes_bolao ON public.bolao_bilhetes (bolao_id, criado_em);

ALTER TABLE public.bolao_bilhetes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bolao_bilhetes FROM anon, authenticated;

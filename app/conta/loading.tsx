// Esqueleto das páginas de /conta enquanto as consultas rodam (todas são
// force-dynamic). Fica dentro da moldura: a navegação aparece na hora e só
// o conteúdo espera.
export default function CarregandoConta() {
  return (
    <div className="m-carregando" role="status" aria-live="polite">
      <span className="m-sr">Carregando…</span>
      <div className="m-esqueleto m-esqueleto--titulo" />
      <div className="m-esqueleto m-esqueleto--linha" />
      <div className="m-esqueleto m-esqueleto--bloco" style={{ marginTop: 24 }} />
      <div className="m-esqueleto m-esqueleto--bloco" />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="rodape">
      <div className="container rodape__inner">
        <p className="rodape__aviso">
          <strong>Aviso:</strong> esta plataforma oferece análises estatísticas e
          probabilísticas com base em resultados históricos oficiais. Loterias são
          jogos de sorteio aleatório e nenhum método estatístico garante ou aumenta a
          probabilidade de premiação. As informações aqui apresentadas têm finalidade
          exclusivamente informativa e recreativa. Jogue com responsabilidade.
        </p>
        <nav className="rodape__links">
          <a href="/sobre">Sobre</a>
          <a href="/dicas#jogo-responsavel">Jogo responsável</a>
        </nav>
      </div>
    </footer>
  );
}

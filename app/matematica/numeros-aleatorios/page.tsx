import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { TesteAleatoriedade } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Aleatoriedade de Verdade — Matemática sem mistério | LotoAnalítica",
  description: "Por que humanos são péssimos em gerar números aleatórios — e o que isso tem a ver com segurança de senhas, fraudes em loterias e geradores pseudoaleatórios.",
  alternates: { canonical: `${SITE_URL}/matematica/numeros-aleatorios` },
  openGraph: { title: "Aleatoriedade de Verdade", description: "Teste se você consegue ser aleatório — e descubra por que provavelmente não.", url: `${SITE_URL}/matematica/numeros-aleatorios`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoNumerosAleatoriosPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🎰</span>
          <div>
            <p className="mat-artigo-conceito">Aleatoriedade e geradores (em inglês: <em>randomness and pseudo-random number generators</em>)</p>
            <h1 className="titulo-edicao">O que é Aleatoriedade de Verdade</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que humanos são péssimos em gerar números aleatórios — e o que isso tem a ver com segurança de senhas, fraudes em loterias e a diferença entre sorteio justo e manipulado.</p>

        <TesteAleatoriedade />

        <h2 className="mat-h2">Por que humanos falham em ser aleatórios</h2>
        <p>Quando pedimos a alguém para "pensar num número aleatório de 1 a 10", o 7 é escolhido desproporcionalmente — entre 20% e 30% das vezes, dependendo da cultura, quando a frequência esperada seria 10%. Em estudos, 3 e 7 são os favoritos; 1 e 10 são evitados por parecerem "óbvios".</p>
        <p>Em sequências, humanos evitam repetir o número anterior. No simulador acima, uma sequência verdadeiramente aleatória de dígitos (0-9) deve ter aproximadamente 10% de repetições consecutivas. Humanos tipicamente produzem menos de 5% — porque "repetir parece menos aleatório".</p>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🧠 O paradoxo do viés de aleatoriedade</p>
          <p>Nosso cérebro evoluiu para detectar padrões — é uma vantagem de sobrevivência. Mas isso nos torna péssimos em reconhecer e gerar aleatoriedade genuína. Sequências verdadeiramente aleatórias parecem ter padrões ("o 7 saiu 3 vezes seguidas!"). Sequências que geramos parecem mais "equilibradas" — mas são na verdade mais previsíveis para quem conhece os vieses humanos.</p>
          <p style={{ marginTop: 8 }}>Este fenômeno tem nome: <strong>viés de apofenia</strong> (em inglês: <em>apophenia bias</em>) — a tendência de ver padrões em ruído aleatório. É a mesma razão pela qual vemos rostos em nuvens e ouvimos mensagens em faixas de ruído branco.</p>
        </div>

        <h2 className="mat-h2">Aleatoriedade verdadeira vs pseudoaleatoriedade</h2>
        <p>Computadores normais não geram números verdadeiramente aleatórios. Eles usam algoritmos determinísticos chamados <strong>geradores pseudoaleatórios</strong> (em inglês: <em>pseudorandom number generators</em> ou PRNG). A partir de uma "semente" (em inglês: <em>seed</em>), geram sequências que parecem aleatórias mas são completamente reproduzíveis — se você sabe a semente, pode prever todos os números futuros.</p>
        <p>Para criptografia e segurança, isso não é suficiente. Sistemas seguros usam fontes de <strong>entropia verdadeira</strong> (em inglês: <em>true entropy</em>): ruído térmico de resistores, timing de eventos do usuário (movimentos do mouse, teclas digitadas), variações quânticas. O sistema operacional Linux usa o arquivo /dev/random para isso.</p>

        <h2 className="mat-h2">Como sorteios de loteria são auditados</h2>
        <p>A Caixa Econômica Federal sorteia as loterias com globos físicos e bolas numeradas — não com software. Os motivos são práticos e legais:</p>
        <p><strong>Auditabilidade:</strong> qualquer pessoa presente pode verificar que as bolas são idênticas em peso e diâmetro, que o processo é físico e que nenhum software pode ser manipulado sem detecção.</p>
        <p><strong>Confiança pública:</strong> um sorteio físico, realizado ao vivo e transmitido, é mais transparente para o público geral do que um algoritmo — mesmo que um bom algoritmo seja matematicamente superior em aleatoriedade.</p>
        <p>Fraudes históricas em loterias físicas envolveram manipulação das bolas (injeção de fluido para tornar algumas mais pesadas), acesso antecipado ao resultado, ou substituição das bolas após o sorteio. Todos esses são vetores de ataque físico — não de software.</p>

        <h2 className="mat-h2">Senhas e aleatoriedade segura</h2>
        <p>Uma senha gerada por humanos ("minhasenha123", data de nascimento, nome do pet) é extremamente previsível. Atacantes com dicionários de senhas comuns testam bilhões por segundo em hardware moderno.</p>
        <p>Uma senha verdadeiramente aleatória de 12 caracteres alfanuméricos (62 possibilidades por caractere) tem 62¹² ≈ 3 × 10²¹ combinações. Com um ataque de 10 bilhões de tentativas por segundo, levaria mais de 9 bilhões de anos para testar todas as possibilidades — tempo geologicamente impossível.</p>
        <p>A diferença entre uma senha humana e uma aleatória não é o comprimento — é a previsibilidade. Um gerenciador de senhas (em inglês: <em>password manager</em>) usa um PRNG criptograficamente seguro para gerar senhas que nenhum humano conseguiria criar ou memorizar.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Humanos têm vieses sistemáticos ao gerar aleatoriedade — evitamos repetições e preferimos certos números.</li>
            <li>Computadores usam PRNGs (determinísticos) — reproduzíveis se a semente for conhecida.</li>
            <li>Sistemas seguros usam fontes de entropia física (ruído térmico, eventos de hardware) para aleatoriedade real.</li>
            <li>Sorteios físicos de loteria são auditáveis e confiáveis por razões de transparência, não de superioridade matemática.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}

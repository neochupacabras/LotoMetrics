import Link from "next/link";
import Masthead from "@/components/Masthead";

export default function DicasPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Guia</p>
        <h1 className="titulo-edicao">Dicas e estratégias</h1>
        <p className="subtitulo-edicao">
          Isso não é uma lista de truques pra ganhar — não existe truque, e qualquer site
          que prometer um é mentira. É um guia de como usar as ferramentas deste site com
          inteligência, e de quais ideias populares sobre loteria são só lenda.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Como as ferramentas do site se encaixam
        </h2>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          Cada seção tem um papel diferente — nenhuma delas prevê o próximo resultado,
          mas juntas ajudam a apostar de forma mais informada e organizada.
        </p>
        <ul style={{ lineHeight: 1.9, paddingLeft: "20px" }}>
          <li>
            <strong>Tabelas estatísticas</strong> mostram o que já aconteceu (frequência,
            atraso, ciclos, e mais) — útil pra entender o histórico, não pra prever o
            futuro.
          </li>
          <li>
            <strong>Gerador de jogos</strong> monta combinações por você. O modo simples é
            um atalho com critérios pré-definidos; o avançado deixa escolher os filtros à
            mão. Nenhum dos dois aumenta sua chance de ganhar — só organiza a escolha.
          </li>
          <li>
            <strong>Fechamentos</strong> servem pra quem já decidiu apostar em mais
            dezenas que o mínimo: cobrem mais combinações gastando menos do que apostar
            todas elas separadamente.
          </li>
          <li>
            <strong>Probabilidades</strong> mostra a chance matemática real de cada faixa
            de prêmio — vale olhar antes de decidir quanto apostar, pra ter expectativa
            realista.
          </li>
          <li>
            <strong>Conferidor</strong> serve pra depois: conferir como um jogo específico
            já teria se saído no histórico inteiro.
          </li>
        </ul>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Mitos comuns (e por que são falsos)
        </h2>

        <div className="bloco">
          <p>
            <strong>"Esse número está atrasado, está devendo sair."</strong>
            <br />
            Não deve nada. Cada sorteio é um evento independente — a loteria não tem
            memória dos concursos anteriores. Um número que não sai há 50 concursos tem
            exatamente a mesma chance no próximo sorteio que um número que acabou de
            sair. Isso é conhecido como "falácia do apostador": a mente humana procura
            padrões onde não existe nenhum.
          </p>
          <p>
            <strong>"Alguns números são mais sortudos que outros."</strong>
            <br />
            Não são. Num sorteio honesto, toda dezena tem exatamente a mesma
            probabilidade de sair, sempre. A tabela de frequência mostra o que já
            aconteceu no passado, não uma tendência que vai continuar.
          </p>
          <p>
            <strong>"Existe um sistema ou software que prevê os números certos."</strong>
            <br />
            Não existe, e se alguém vender isso, é golpe. Sorteios de loteria usam
            mecanismos físicos ou geradores certificados — não há padrão a ser
            decifrado.
          </p>
          <p>
            <strong>"Jogar sempre os mesmos números aumenta a chance com o tempo."</strong>
            <br />
            Cada concurso é um sorteio novo. Jogar o mesmo número por 10 anos não muda a
            chance dele sair no concurso de amanhã.
          </p>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }} id="o-que-faz-diferenca">
          O que realmente faz diferença
        </h2>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          Nada aqui aumenta a chance de acertar. Mas algumas escolhas mudam outras coisas
          de verdade:
        </p>
        <ul style={{ lineHeight: 1.9, paddingLeft: "20px" }}>
          <li>
            <strong>Evitar números muito populares</strong> (como datas de aniversário,
            geralmente entre 1 e 31) não aumenta sua chance de ganhar — mas, se você
            ganhar, pode aumentar o valor que você recebe. Como muita gente escolhe
            números nessa faixa, sorteios com esse perfil tendem a ter mais ganhadores
            dividindo o mesmo prêmio.
          </li>
          <li>
            <strong>Fechamentos</strong> aumentam sua cobertura de combinações, não sua
            sorte. Apostar mais dezenas custa mais — o fechamento existe pra fazer esse
            custo extra render mais combinações úteis, não pra mudar a probabilidade de
            base.
          </li>
          <li>
            <strong>Bolões</strong> dividem custo e prêmio proporcionalmente entre o
            grupo — permitem cobrir mais combinações com menos dinheiro por pessoa, ao
            custo de dividir o que vier.
          </li>
          <li>
            <strong>Definir um orçamento antes de jogar</strong>, e não depois, é a única
            estratégia financeira que realmente funciona aqui.
          </li>
        </ul>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }} id="jogo-responsavel">
          Jogo responsável
        </h2>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          Loteria é entretenimento, não uma fonte de renda nem um investimento — o
          resultado esperado de qualquer aposta, matematicamente, é perder um pouco a
          cada jogo (é assim que o prêmio existe). Jogue só com dinheiro que você pode
          perder sem que isso afete o resto da sua vida, e desconfie de qualquer impulso
          de "recuperar" o que perdeu apostando mais.
        </p>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          Sinais de que vale parar e conversar com alguém: pensar em apostas o tempo
          todo, apostar mais do que planejava pra tentar recuperar perdas, esconder
          quanto está gastando, ou sentir que não consegue parar mesmo quando quer.
        </p>
        <p className="subtitulo-edicao" style={{ maxWidth: 700 }}>
          Se isso soa familiar, ajuda gratuita existe: Centro de Valorização da Vida
          (CVV) — 188, 24h, também por chat em{" "}
          <span style={{ whiteSpace: "nowrap" }}>cvv.org.br</span>; Centros de Atenção
          Psicossocial (CAPS) — unidades do SUS, encontre a mais próxima pela secretaria
          de saúde do seu município; e Jogadores Anônimos — grupos de apoio gratuitos,
          presenciais e online, em jogadoresanonimos.com.br.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Esta página é conteúdo educativo, não aconselhamento financeiro ou médico.
          Apostas de loteria são jogos de azar regulados pela Caixa Econômica Federal —
          jogue apenas se for maior de 18 anos e estiver de acordo com a legislação do
          seu local.
        </div>

        <p style={{ marginTop: "24px" }}>
          <Link href="/" className="breadcrumb">
            ← Voltar para a página inicial
          </Link>
        </p>
      </main>
    </>
  );
}

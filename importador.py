"""
Importador de resultados de loterias (Lotofacil e Mega-Sena) da API da Caixa
para PostgreSQL.

Modos de uso
------------

1) Carga historica completa (rodar uma vez, manualmente, por loteria):
   python importador.py --loteria lotofacil --modo backfill --inicio 1 --fim 3713
   python importador.py --loteria megasena --modo backfill --inicio 1 --fim 3019

2) Execucao incremental (a que vai para o agendador/Task Scheduler):
   python importador.py
   (modo padrao = incremental; busca, para cada loteria cadastrada, do
    proximo numero depois do ultimo salvo no banco ate o concurso mais
    recente disponivel na API. Seguro de rodar repetidas vezes: se nao
    houver concurso novo, nao faz nada.)

3) Importar/corrigir um concurso especifico:
   python importador.py --loteria megasena --modo unico --numero 2935

Configuracao do banco via variaveis de ambiente:
   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
(ou edite os valores padrao em DB_CONFIG abaixo)
"""

import argparse
import logging
import os
import sys
import time
from datetime import datetime
from typing import Optional

import psycopg2
import requests

BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; ProjetoLoterias/1.0)",
    "Accept": "application/json",
}
TIMEOUT_SEGUNDOS = 10
INTERVALO_ENTRE_CHAMADAS = 1.0
MAX_TENTATIVAS = 3

LOTERIAS_CODIGO_API = {
    "lotofacil": "lotofacil",
    "megasena":  "megasena",
    "quina":     "quina",
    "lotomania":  "lotomania",
    "diadesorte": "diadesorte",
}

DB_CONFIG = {
    "host": os.environ.get("PGHOST", "localhost"),
    "port": os.environ.get("PGPORT", "5432"),
    "dbname": os.environ.get("PGDATABASE", "loterias"),
    "user": os.environ.get("PGUSER", "postgres"),
    "password": os.environ.get("PGPASSWORD", ""),
    # SSL obrigatório para conexão via pooler do Supabase (porta 6543)
    # PGUSER deve ser no formato postgres.PROJECTREF para o pooler identificar o tenant
    "sslmode": os.environ.get("PGSSLMODE", "require"),
}
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("importador_loterias.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)


def conectar_banco():
    return psycopg2.connect(**DB_CONFIG)


def buscar_resultado_api(loteria_codigo: str, numero: Optional[int] = None) -> Optional[dict]:
    url = f"{BASE_URL}/{loteria_codigo}"
    if numero is not None:
        url = f"{url}/{numero}"

    for tentativa in range(1, MAX_TENTATIVAS + 1):
        try:
            resposta = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SEGUNDOS)
        except requests.RequestException as erro:
            log.warning("Tentativa %d/%d falhou (%s): %s", tentativa, MAX_TENTATIVAS, url, erro)
            time.sleep(2 * tentativa)
            continue

        if resposta.status_code == 200:
            try:
                return resposta.json()
            except ValueError:
                log.error("Resposta nao e um JSON valido para %s", url)
                return None

        log.warning("Status %d em %s (tentativa %d/%d)", resposta.status_code, url, tentativa, MAX_TENTATIVAS)
        time.sleep(2 * tentativa)

    log.error("Falhou apos %d tentativas: %s", MAX_TENTATIVAS, url)
    return None


def parse_data(data_str: Optional[str]):
    if not data_str:
        return None
    return datetime.strptime(data_str, "%d/%m/%Y").date()


def parse_dezenas(lista):
    return [int(d) for d in lista] if lista else []


def obter_loteria_id(conn, codigo: str) -> int:
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM loteria WHERE codigo = %s", (codigo,))
        linha = cur.fetchone()
        if not linha:
            raise RuntimeError(f"Loteria '{codigo}' nao cadastrada na tabela loteria (rode setup_banco.sql).")
        return linha[0]


def obter_ultimo_numero_salvo(conn, loteria_id: int) -> int:
    with conn.cursor() as cur:
        cur.execute("SELECT COALESCE(MAX(numero), 0) FROM concurso WHERE loteria_id = %s", (loteria_id,))
        return cur.fetchone()[0]


def salvar_concurso(conn, loteria_id: int, dados: dict) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO concurso (
                loteria_id, numero, data_sorteio, dezenas, dezenas_ordem_sorteio,
                acumulado, local_sorteio, municipio_uf_sorteio,
                valor_arrecadado, valor_acumulado_proximo, valor_estimado_proximo,
                data_proximo_concurso, mes_sorte, atualizado_em
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
            ON CONFLICT (loteria_id, numero) DO UPDATE SET
                data_sorteio = EXCLUDED.data_sorteio,
                dezenas = EXCLUDED.dezenas,
                dezenas_ordem_sorteio = EXCLUDED.dezenas_ordem_sorteio,
                acumulado = EXCLUDED.acumulado,
                local_sorteio = EXCLUDED.local_sorteio,
                municipio_uf_sorteio = EXCLUDED.municipio_uf_sorteio,
                valor_arrecadado = EXCLUDED.valor_arrecadado,
                valor_acumulado_proximo = EXCLUDED.valor_acumulado_proximo,
                valor_estimado_proximo = EXCLUDED.valor_estimado_proximo,
                data_proximo_concurso = EXCLUDED.data_proximo_concurso,
                mes_sorte = EXCLUDED.mes_sorte,
                atualizado_em = now()
            RETURNING id
            """,
            (
                loteria_id,
                dados.get("numero"),
                parse_data(dados.get("dataApuracao")),
                parse_dezenas(dados.get("listaDezenas")),
                parse_dezenas(dados.get("dezenasSorteadasOrdemSorteio")),
                dados.get("acumulado", False),
                dados.get("localSorteio"),
                dados.get("nomeMunicipioUFSorteio"),
                dados.get("valorArrecadado"),
                dados.get("valorAcumuladoProximoConcurso"),
                dados.get("valorEstimadoProximoConcurso"),
                parse_data(dados.get("dataProximoConcurso")),
                dados.get("nomeTimeCoracaoMesSorte"),  # campo exclusivo do Dia de Sorte
            ),
        )
        concurso_id = cur.fetchone()[0]

        cur.execute("DELETE FROM premiacao_faixa WHERE concurso_id = %s", (concurso_id,))
        for faixa in dados.get("listaRateioPremio", []) or []:
            cur.execute(
                """
                INSERT INTO premiacao_faixa (concurso_id, faixa, descricao_faixa, qtd_ganhadores, valor_premio)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    concurso_id,
                    faixa.get("faixa"),
                    faixa.get("descricaoFaixa"),
                    faixa.get("numeroDeGanhadores", 0),
                    faixa.get("valorPremio", 0),
                ),
            )
    conn.commit()


def importar_concurso(conn, loteria_codigo: str, loteria_id: int, numero: int) -> bool:
    dados = buscar_resultado_api(LOTERIAS_CODIGO_API[loteria_codigo], numero)
    if not dados or dados.get("numero") != numero:
        log.error("Concurso %d de %s nao retornou dados validos.", numero, loteria_codigo)
        return False
    salvar_concurso(conn, loteria_id, dados)
    log.info("Concurso %d de %s salvo/atualizado.", numero, loteria_codigo)
    return True


def importar_intervalo(conn, loteria_codigo: str, inicio: int, fim: int) -> None:
    loteria_id = obter_loteria_id(conn, loteria_codigo)
    total = fim - inicio + 1
    sucesso = 0
    for i, numero in enumerate(range(inicio, fim + 1), start=1):
        if importar_concurso(conn, loteria_codigo, loteria_id, numero):
            sucesso += 1
        if i % 50 == 0 or i == total:
            log.info("Progresso %s: %d/%d concursos processados (%d ok).", loteria_codigo, i, total, sucesso)
        time.sleep(INTERVALO_ENTRE_CHAMADAS)
    log.info("Backfill de %s concluido: %d/%d concursos importados com sucesso.", loteria_codigo, sucesso, total)


def importar_incremental(conn, loteria_codigo: str) -> None:
    loteria_id = obter_loteria_id(conn, loteria_codigo)
    ultimo_salvo = obter_ultimo_numero_salvo(conn, loteria_id)

    dados_recentes = buscar_resultado_api(LOTERIAS_CODIGO_API[loteria_codigo])
    if not dados_recentes:
        log.error("Nao foi possivel obter o ultimo concurso de %s na API.", loteria_codigo)
        return

    ultimo_disponivel = dados_recentes.get("numero")
    if ultimo_disponivel is None:
        log.error("Resposta da API para %s sem campo 'numero'.", loteria_codigo)
        return

    if ultimo_salvo == 0:
        log.warning(
            "Nenhum concurso de %s no banco ainda. Rode antes o backfill "
            "(--modo backfill --inicio 1 --fim %d).",
            loteria_codigo, ultimo_disponivel,
        )
        return

    if ultimo_disponivel <= ultimo_salvo:
        log.info(
            "%s ja esta em dia (ultimo salvo: %d, ultimo disponivel: %d).",
            loteria_codigo, ultimo_salvo, ultimo_disponivel,
        )
        return

    log.info("%s: importando concursos %d a %d.", loteria_codigo, ultimo_salvo + 1, ultimo_disponivel)
    importar_intervalo(conn, loteria_codigo, ultimo_salvo + 1, ultimo_disponivel)


def main():
    parser = argparse.ArgumentParser(description="Importador de resultados de loterias da Caixa.")
    parser.add_argument("--loteria", choices=["lotofacil", "megasena", "quina", "lotomania", "diadesorte", "todas"], default="todas")
    parser.add_argument("--modo", choices=["incremental", "backfill", "unico"], default="incremental")
    parser.add_argument("--inicio", type=int, help="Numero inicial (modo backfill)")
    parser.add_argument("--fim", type=int, help="Numero final (modo backfill)")
    parser.add_argument("--numero", type=int, help="Numero do concurso (modo unico)")
    args = parser.parse_args()

    loterias = ["lotofacil", "megasena", "quina", "lotomania", "diadesorte"] if args.loteria == "todas" else [args.loteria]

    conn = conectar_banco()
    try:
        for loteria_codigo in loterias:
            log.info("=== Processando %s (modo=%s) ===", loteria_codigo, args.modo)

            if args.modo == "incremental":
                importar_incremental(conn, loteria_codigo)

            elif args.modo == "backfill":
                if args.inicio is None or args.fim is None:
                    log.error("Modo backfill requer --inicio e --fim.")
                    sys.exit(1)
                importar_intervalo(conn, loteria_codigo, args.inicio, args.fim)

            elif args.modo == "unico":
                if args.numero is None:
                    log.error("Modo unico requer --numero.")
                    sys.exit(1)
                loteria_id = obter_loteria_id(conn, loteria_codigo)
                importar_concurso(conn, loteria_codigo, loteria_id, args.numero)
    finally:
        conn.close()


if __name__ == "__main__":
    main()

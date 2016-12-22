import psycopg2
import csv
import psycopg2.extras

conn = psycopg2.connect("dbname=sp host=127.0.0.1 user=postgres")

cur=conn.cursor('q',cursor_factory=psycopg2.extras.DictCursor)

cur.execute('SELECT * FROM escolas WHERE "ANO_CENSO"=2014 AND "LOC_SIRGAS" IS NOT NULL;')

fc=open('corresp.tsv','w')
fo=open('out.tsv', 'w')
corresp=csv.writer(fc,delimiter='\t')
outf=csv.writer(fo,delimiter='\t')

rcount=0
for row in cur:
    corresp.writerow([rcount,row['PK_COD_ENTIDADE']])
    outf.writerow([row["ID_DEPENDENCIA_ADM"],
                   row["ID_CONVENIADA_PP"],
                   row["ID_LINGUA_PORTUGUESA"],
                   row["ID_EDUCACAO_INDIGENA"],
                   row["ID_LINGUA_INDIGENA"],
                   row["FK_COD_LINGUA_INDIGENA"],
                   row["ID_LOCAL_FUNC_PREDIO_ESCOLAR"],
                   row["ID_LOCAL_FUNC_PRISIONAL"],
                   row["ID_LOCAL_FUNC_OUTROS"],
                   row["ID_LOCALIZACAO"],
                   row["ID_LOCALIZACAO_DIFERENCIADA"],
                   row["NUM_FUNCIONARIOS"],
                   row["NUM_SALAS_EXISTENTES"],
                   row["NUM_SALAS_UTILIZADAS"],
                   row["NUM_COMPUTADORES"],
                   row["NUM_COMP_ADMINISTRATIVOS"],
                   row["NUM_COMP_ALUNOS"],
                   row["DESC_CATEGORIA_ESCOLA_PRIVADA"],
                   row["DESC_SITUACAO_FUNCIONAMENTO"],
                   row["ID_ALIMENTACAO"],
                   row["ID_AGUA_FILTRADA"],
                   row["ID_AGUA_INEXISTENTE"],
                   row["ID_ENERGIA_INEXISTENTE"],
                   row["ID_ESGOTO_INEXISTENTE"],
                   row["ID_LIXO_COLETA_PERIODICA"],
                   row["ID_LIXO_ENTERRA"],
                   row["ID_LIXO_JOGA_OUTRA_AREA"],
                   row["ID_LIXO_OUTROS"],
                   row["ID_LIXO_QUEIMA"],
                   row["ID_LIXO_RECICLA"],
                   row["ID_SANITARIO_DENTRO_PREDIO"],
                   row["ID_SANITARIO_FORA_PREDIO"],
                   row["ID_SANITARIO_PNE"],
                   row["ID_SALA_ATENDIMENTO_ESPECIAL"],
                   row["ID_SALA_DIRETORIA"],
                   row["ID_SALA_PROFESSOR"],
                   row["ID_BIBLIOTECA"],
                   row["ID_COZINHA"],
                   row["ID_DEPENDENCIAS_PNE"],
                   row["ID_INTERNET"],
                   row["ID_LABORATORIO_CIENCIAS"],
                   row["ID_LABORATORIO_INFORMATICA"],
                   row["ID_PARQUE_INFANTIL"],
                   row["ID_QUADRA_ESPORTES"],
                   row["ID_MOD_ENS_REGULAR"],
                   row["ID_REG_FUND_8_ANOS"],
                   row["ID_REG_FUND_9_ANOS"],
                   row["ID_REG_INFANTIL_CRECHE"],
                   row["ID_REG_INFANTIL_PREESCOLA"],
                   row["ID_REG_MEDIO_INTEGRADO"],
                   row["ID_REG_MEDIO_MEDIO"],
                   row["ID_REG_MEDIO_NORMAL"],
                   row["ID_REG_MEDIO_PROF"],
                   row["ID_MOD_EJA"],
                   row["ID_EJA_FUNDAMENTAL"],
                   row["ID_EJA_MEDIO"],
                   row["ID_MOD_ENS_ESP"],
                   row["ID_ESP_FUND_8_ANOS"],
                   row["ID_ESP_FUND_9_ANOS"],
                   row["ID_ESP_INFANTIL_CRECHE"],
                   row["ID_ESP_INFANTIL_PREESCOLA"],
                   row["ID_ESP_MEDIO_INTEGRADO"],
                   row["ID_ESP_MEDIO_MEDIO"],
                   row["ID_ESP_MEDIO_NORMAL"],
                   row["ID_ESP_PROFISSIONAL"],
                   row["ID_ESP_EJA_FUNDAMENTAL"],
                   row["ID_ESP_EJA_MEDIO"]])
    rcount+=1
fo.close()
fc.close()

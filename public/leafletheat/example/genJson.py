import csv
import psycopg2
import psycopg2.extras


psycopg2.extras.register_default_json(loads=lambda x: x)

conn = psycopg2.connect("dbname=sp host=127.0.0.1 user=postgres")

cur=conn.cursor()

fc=open('colors.tsv','r')
corcsv=csv.reader(fc,delimiter='\t')

cur.execute("ALTER TABLE escolas ADD COLUMN cor text;")
conn.commit()
for row in corcsv:
    cur.execute('UPDATE escolas SET cor=%s WHERE "PK_COD_ENTIDADE"=%s;',(row[1],row[0]))
conn.commit()


sql="""
 SELECT row_to_json(fc)
 FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
 FROM (SELECT 'Feature' As type
    , ST_AsGeoJSON(lg."LOC_SIRGAS")::json As geometry
    , row_to_json((SELECT l FROM (SELECT "PK_COD_ENTIDADE","NO_ENTIDADE", cor) As l
      )) As properties
   FROM escolas As lg WHERE "ANO_CENSO"=2014 AND "LOC_SIRGAS" is not null    ) As f )  As fc;"""

cur.execute(sql)
res=cur.fetchone()
print(res[0])
cur.execute("ALTER TABLE escolas DROP COLUMN cor;")
conn.commit()

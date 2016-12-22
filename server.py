import os, os.path
import json
import csv

import cherrypy

import pandas as pd
import numpy as np

class Initializer(object):
    @cherrypy.expose
    def index(self):
        return open('index.html')
        
@cherrypy.expose
class DataQuery(object):
    dataFrame = None
    
    def POST(self, filename):
        self.filename = filename
        self.dataFrame = pd.read_csv(filename, delimiter='\t')
        return 'true'
    
    def GET(self, setId="-1 -1 -1 -1"):
        output = None
        ids = json.loads( setId )
        
        sel = [True]*len(self.dataFrame)
        keys = self.dataFrame.keys()
        for i in range(len(ids)):
            col = keys[i]
            vals = ids[i]
            if vals[0]!=-1 :
                colSel = self.dataFrame[col].apply(lambda x: x in vals)
                sel = colSel & sel

        selected = self.dataFrame[sel][["Latitude", "Longitude", "Codigo do crime"]]
        return selected.to_json(orient='records')
        
if __name__ == '__main__':
    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/query': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Accept', 'application/json')],
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': './public'
        }
    }
    
    webapp = Initializer()
    webapp.query = DataQuery()
    cherrypy.quickstart(webapp, '/', conf)

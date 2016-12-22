import numpy as np
import networkx as nx
import sys
import csv
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import matplotlib.colors

from time import time
from sklearn import (manifold, datasets, decomposition, ensemble,
                     discriminant_analysis, random_projection)

from sklearn.cluster import DBSCAN,AgglomerativeClustering,Birch,KMeans
from sklearn import metrics
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import pickle


def doCluster(X_o):
    # Compute DBSCAN
    X = StandardScaler().fit_transform(X_o)
    x_min, x_max = np.min(X_o, 0), np.max(X_o, 0)
    X_o = (X_o - x_min) / (x_max - x_min)

#    model = KMeans(n_clusters=10)
    model = AgglomerativeClustering(n_clusters=15)
#    model = Birch(threshold=0.25)
#    model = DBSCAN()
    model.fit(X)
    labels = model.labels_
    
    # Number of clusters in labels, ignoring noise if present.
    n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
    
    print('Estimated number of clusters: %d' % n_clusters_)
    
    ##############################################################################

    # Black removed and is used for noise instead.
    unique_labels = set(labels)
    cs = plt.cm.Spectral(np.linspace(0, 1, len(unique_labels)))
    plt.figure()
    for k, col in zip(unique_labels, cs):
        if k == -1:
        # Black used for noise.
            col = 'k'

        class_member_mask = (labels == k)
        
        xy = X_o[class_member_mask]
        plt.scatter(xy[:,0],xy[:,1],c=col,s=14,linewidths=0.5) #was 9
#        plt.plot(xy[:, 0], xy[:, 1], 'o', markerfacecolor=col,
#                 markeredgecolor='k', markersize=3)


    np.savetxt(fpref+'labels.txt',np.hstack((X_orig,np.reshape(model.labels_,(-1,1)))),fmt='%g')

    title=fpref+'Estimated number of clusters: %d' % n_clusters_
    plt.title(title)
    plt.axis('tight')
    axis=plt.axis()


#    plt.savefig(title.replace(' ','_').strip()+'.png')
    plt.savefig(title.replace(' ','_').strip()+'.eps')

    title=fpref+'proj'
    plt.figure()
    plt.scatter(X_o[:,0],X_o[:,1],c=colors/np.max(colors),cmap=plt.get_cmap('plasma'),s=14,linewidths=0.5)
    
    plt.title(title)
    plt.axis(axis)
#    plt.savefig(title.replace(' ','_').strip()+'.png')
    plt.savefig(title.replace(' ','_').strip()+'.eps')


#    plt.show()




ndims=2#int(sys.argv[2])
v=np.loadtxt(sys.argv[1])
nbrs = NearestNeighbors(n_neighbors=10, algorithm='ball_tree').fit(v)
G=nx.from_numpy_matrix(nbrs.kneighbors_graph(v).toarray())
#G=nx.Graph()                        

for n in G.nodes():
    G.node[n]['c']=0;
    G.node[n]['data']=v[n]


G.node[G.nodes()[0]]['c']=1;
todo=[G.nodes()[0],]
while len(todo)>0:
    cn=todo.pop(0)
    todo.extend([x for x in G.neighbors(cn) if (G.node[x]['c']==0)])
    for y in G.neighbors(cn):
        if (G.node[y]['c']==0):
            G.node[y]['c']=G.node[cn]['c']+1

X=[]
cv=0

maxColor=0

for n in G.nodes():
    X.append(list(G.node[n]['data']))
    if (G.node[n]['c']>maxColor):
        maxColor=G.node[n]['c']
    G.node[n]['vi']=cv
    cv+=1
    
print(len(G))
colors=np.zeros((len(G),1))
for n in G.nodes():
    colors[G.node[n]['vi']]=G.node[n]['c']

fcolors=open('colors.tsv','w')
fcorresp=open('corresp.tsv','r')
ctsv=csv.writer(fcolors,delimiter='\t')
fc=csv.reader(fcorresp,delimiter='\t')
corresp=dict()
for row in fc:
    corresp[int(row[0])]=row[1]

my_cmap = cm.get_cmap('plasma')
#my_cmap = cm.get_cmap('Oranges')
print(maxColor)
norm = matplotlib.colors.Normalize(0,maxColor)

for n in G.nodes():
    ccor=[int(255*x)for x in my_cmap(norm(G.node[n]['c']))]
    ctsv.writerow([corresp[n],'#{0:02X}{1:02X}{2:02X}'.format(ccor[0],ccor[1],ccor[2])])
fcolors.close()
fcorresp.close()

print('colors exported')
exit()
X=np.array(X,dtype=np.float64)
X_orig=X

n_neighbors=10
n_samples, n_features = X.shape


# t-SNE embedding 
print("Computing t-SNE embedding")
if True:
    tsne = manifold.TSNE(n_components=ndims, init='pca', random_state=0)
    t0 = time()
    X_tsne = tsne.fit_transform(X)
    with open('X_tsne.pickle', 'wb') as f:
        pickle.dump(X_tsne, f)
else:
    with open('X_tsne.pickle', 'rb') as f:
        X_tsne = pickle.load(f)    

#doCluster(X_tsne)


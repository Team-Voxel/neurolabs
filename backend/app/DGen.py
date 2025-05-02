import time

import sklearn.datasets as skd
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

fig, axs = plt.subplots(1, 2, figsize=(12, 4), sharey=True, sharex=True)
X, Y = skd.make_classification(n_features=10, n_redundant=0, random_state=1, n_informative=2, n_classes=2, n_clusters_per_class=2)
X1, Y1 = skd.make_blobs(n_features=2, centers=5)

print(len(X))

pca = PCA(n_components=2)
X = pca.fit_transform(X)

print(len(X))

axs[0].scatter(X[:, 0], X[:, 1], c=Y)
axs[1].scatter(X1[:, 0], X1[:, 1], c=Y1)


plt.show()
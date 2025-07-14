from sklearn.datasets import make_regression, make_classification, make_blobs
from sklearn.model_selection import train_test_split
from torchmlp import TorchMLP
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

#X, y = make_regression(n_samples=500, n_features=10, noise=5.0)
X,y = make_blobs(n_samples=500, n_features=2, centers=3, random_state=1, cluster_std=1.0)
X_train, X_test, y_train, y_test = train_test_split(X, y)

model = TorchMLP(is_classification=True, hidden_layer_sizes=(64, 32), max_iter=100, verbose=True, history_size=100)
model.fit(X_train, y_train)

svc = SVC(C=1.0)
svc.fit(X_train, y_train)

preds = svc.predict(X_test)
acc = accuracy_score(y_test, preds)
print("Accuracy SVC:", acc)

print("Support Vectors:", svc.support_vectors_)
print("Support Vectors From Indices:", svc.support_)

preds = model.predict_classes(X_test)
acc = accuracy_score(y_test, preds)
print("Accuracy TorchMLP:", acc)

print("Accuracy:", model.score(X_test, y_test)['accuracy'])
print("Precision:", model.score(X_test, y_test)['precision'])
print("Recall:", model.score(X_test, y_test)['recall'])
print("F1 Score:", model.score(X_test, y_test)['f1_score'])
print("ROC AUC:", model.score(X_test, y_test)['roc_auc'])


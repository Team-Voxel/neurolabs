from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from torchmlp import TorchMLP

X, y = make_regression(n_samples=500, n_features=10, noise=5.0)
X_train, X_test, y_train, y_test = train_test_split(X, y)

model = TorchMLP(is_classification=False, hidden_layer_sizes=(64, 32), max_iter=100, verbose=True)
model.fit(X_train, y_train)

print("R^2 Score:", model.score(X_test, y_test))
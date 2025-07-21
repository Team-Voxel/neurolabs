import torch
import torch.nn as nn
from sklearn.base import BaseEstimator
from sklearn.model_selection import train_test_split
import numpy as np

class _BaseMLP(BaseEstimator):
    """
    Base class for MLPClassifier and MLPRegressor.
    """
    def __init__(self, hidden_layer_sizes=(100,), activation='relu',
                 optimizer='adam', learning_rate_init=0.001, max_iter=200,
                 batch_size=200, random_state=None, loss=None):
        self.hidden_layer_sizes = hidden_layer_sizes
        self.activation = activation
        self.optimizer = optimizer
        self.learning_rate_init = learning_rate_init
        self.max_iter = max_iter
        self.batch_size = batch_size
        self.random_state = random_state
        self.loss = loss

        self.model_ = None

    def _initialize(self, X, y):
        if self.random_state is not None:
            torch.manual_seed(self.random_state)

        # Determine input and output sizes
        n_features = X.shape[1]
        if self._is_classifier():
            self.n_classes_ = len(np.unique(y))
            output_size = self.n_classes_  # Always use n_classes_ output neurons
        else:
            output_size = y.shape[1] if len(y.shape) > 1 else 1

        # Select activation function
        activation_functions = {
            'identity': nn.Identity(),
            'sigmoid': nn.Sigmoid(),
            'tanh': nn.Tanh(),
            'relu': nn.ReLU(),
            'leakyrelu': nn.LeakyReLU()
        }
        self.activation_ = activation_functions.get(self.activation)
        if self.activation_ is None:
            raise ValueError(f"Activation function '{self.activation}' is not supported.")
        
        # Create the neural network
        self.model_ = self._build_model(n_features, output_size)

        # Select optimizer
        optimizers = {
            'sgd': torch.optim.SGD(self.model_.parameters(), lr=self.learning_rate_init),
            'adam': torch.optim.Adam(self.model_.parameters(), lr=self.learning_rate_init)
        }
        self.optimizer_ = optimizers.get(self.optimizer)
        if self.optimizer_ is None:
            raise ValueError(f"Optimizer '{self.optimizer}' is not supported.")


    def _build_model(self, input_size, output_size):
        layers = []
        layer_sizes = [input_size] + list(self.hidden_layer_sizes) + [output_size]
        for i in range(len(layer_sizes) - 1):
            layers.append(nn.Linear(layer_sizes[i], layer_sizes[i+1]))
            if i < len(layer_sizes) - 2:
                layers.append(self.activation_)
        return nn.Sequential(*layers)

    def fit(self, X, y):
        X = torch.from_numpy(X).float()
        if self._is_classifier():
            y = torch.from_numpy(y).long()
        else:
            y = torch.from_numpy(y).float().view(-1, 1)

        self._initialize(X, y)

        if self.loss is None:
            if self._is_classifier():
                self.criterion_ = nn.CrossEntropyLoss()
            else:
                self.criterion_ = nn.MSELoss()
        else:
            self.criterion_ = self.loss

        dataset = torch.utils.data.TensorDataset(X, y)
        loader = torch.utils.data.DataLoader(dataset, batch_size=self.batch_size, shuffle=True)

        for epoch in range(self.max_iter):
            for inputs, targets in loader:
                self.optimizer_.zero_grad()
                outputs = self.model_(inputs)
                loss = self.criterion_(outputs, targets)
                loss.backward()
                self.optimizer_.step()
        return self

    def _is_classifier(self):
        return isinstance(self, TorchMLPClassifier)
    
    def get_state_dict(self):
        return self.model_.state_dict()
    
    def load_state_dict(self, state_dict):
        self.model_.load_state_dict(state_dict)
        self.model_.eval()  # Set the model to evaluation mode
        return self
    
    def predict(self, X):
        raise NotImplementedError("This method should be implemented in subclasses.")



class TorchMLPClassifier(_BaseMLP):
    """
    A multi-layer perceptron classifier implemented in PyTorch with a scikit-learn like API.
    """
    def predict(self, X):
        self.model_.eval()
        with torch.no_grad():
            X = torch.from_numpy(X).float()
            outputs = self.model_(X)
            _, predicted = torch.max(outputs.data, 1)  # Use max for both binary and multi-class
        return predicted.numpy()

    def predict_proba(self, X):
        self.model_.eval()
        with torch.no_grad():
            X = torch.from_numpy(X).float()
            outputs = self.model_(X)
            probas = torch.softmax(outputs, dim=1)  # Always use softmax for all cases
        return probas.numpy()
    


class TorchMLPRegressor(_BaseMLP):
    """
    A multi-layer perceptron regressor implemented in PyTorch with a scikit-learn like API.
    """
    def predict(self, X):
        self.model_.eval()
        with torch.no_grad():
            X = torch.from_numpy(X).float()
            predicted = self.model_(X)
        return predicted.numpy().flatten()
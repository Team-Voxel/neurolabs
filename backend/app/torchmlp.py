import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score, roc_curve

class TorchMLP:
    def __init__(self, is_classification = True, hidden_layer_sizes=(100,), activation='relu',
                 optimizer='adam', learning_rate=0.001, max_iter=200,
                 batch_size=32, verbose=False, device='cpu'):
        
        self.is_classification = is_classification
        if is_classification:
            self.loss_fn = nn.CrossEntropyLoss()
        else:
            self.loss_fn = nn.SmoothL1Loss() # Or MSE but SmoothL1 is more robust to outliers
        
        self.hidden_layer_sizes = hidden_layer_sizes
        self.activation = activation
        self.optimizer_type = optimizer
        self.learning_rate = learning_rate
        self.max_iter = max_iter
        self.batch_size = batch_size
        self.verbose = verbose
        self.device = device or 'cpu' # GPU is not supported in this environment

        self.model = None
        self.history = []

    def _build_model(self, input_dim, output_dim):
        layers = []
        last_dim = input_dim
        
        # Hidden layers
        for h in self.hidden_layer_sizes:
            layers.append(nn.Linear(last_dim, h))
            if self.activation == 'relu':
                layers.append(nn.ReLU())
            elif self.activation == 'tanh':
                layers.append(nn.Tanh())
            elif self.activation == 'logistic':
                layers.append(nn.Sigmoid())
            elif self.activation == 'leaky_relu':
                layers.append(nn.LeakyReLU())
            else:
                raise ValueError("Unsupported activation.")
            last_dim = h

        # Output layer
        layers.append(nn.Linear(last_dim, output_dim))
        self.model = nn.Sequential(*layers).to(self.device)

    def fit(self, X, y):
        X = torch.tensor(X, dtype=torch.float32).to(self.device)
        y = torch.tensor(y, dtype=torch.float32).to(self.device)

        if len(y.shape) == 1:
            y = y.unsqueeze(1)  # Ensure (N, 1) shape for regression

        self._build_model(X.shape[1], y.shape[1])
        
        if self.optimizer_type == 'adam':
            optimizer = optim.Adam(self.model.parameters(), lr=self.learning_rate)
        elif self.optimizer_type == 'sgd':
            optimizer = optim.SGD(self.model.parameters(), lr=self.learning_rate)
        else:
            raise ValueError("Unsupported optimizer.")

        dataset = torch.utils.data.TensorDataset(X, y)
        loader = torch.utils.data.DataLoader(dataset, batch_size=self.batch_size, shuffle=True)

        for epoch in range(self.max_iter):
            self.model.train()
            epoch_loss = 0.0
            for batch_X, batch_y in loader:
                optimizer.zero_grad()
                output = self.model(batch_X)
                loss = self.loss_fn(output, batch_y)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item() * batch_X.size(0)
            avg_loss = epoch_loss / len(X)

            if self.is_classification:
                self.model.eval()
                with torch.no_grad():
                    preds = self.model(X)
                    predicted_classes = preds.argmax(dim=1)
                    true_classes = y.argmax(dim=1) if y.ndim > 1 else y.long()
                    correct = (predicted_classes == true_classes).sum().item()
                    accuracy = correct / len(y)
            else:
                accuracy = self.score(X.cpu().numpy(), y.cpu().numpy())['r2']

            self.history.append({'loss': avg_loss, 'accuracy': accuracy})

            if self.verbose:
                print(f"Epoch {epoch+1}/{self.max_iter} - Loss: {avg_loss:.4f}, Accuracy: {accuracy:.4f}")

    def predict(self, X):
        X = torch.tensor(X, dtype=torch.float32)
        self.model.eval()
        with torch.no_grad():
            preds = self.model(X)
        return preds.cpu().numpy().squeeze()

    def get_loss_history(self):
        return self.history

    def score(self, X, y):
        preds = self.predict(X)
        y_true = np.array(y)

        results = {}
        if self.is_classification:
            if preds.ndim > 1 and preds.shape[1] > 1:
                y_pred_classes = preds.argmax(axis=1)
                y_proba = preds[:, 1] if preds.shape[1] > 1 else preds
            else:
                y_pred_classes = (preds > 0.5).astype(int)
                y_proba = preds

            results['confusion_matrix'] = confusion_matrix(y_true, y_pred_classes).tolist()
            results['classification_report'] = classification_report(y_true, y_pred_classes, output_dict=True)
            try:
                results['roc_auc'] = roc_auc_score(y_true, y_proba)
                fpr, tpr, thresholds = roc_curve(y_true, y_proba)
                results['roc_curve'] = {'fpr': fpr.tolist(), 'tpr': tpr.tolist(), 'thresholds': thresholds.tolist()}
            except:
                results['roc_auc'] = None
                results['roc_curve'] = None
        else:
            # Regression R^2 score
            results['r2'] = 1.0 - np.mean((preds - y_true) ** 2) / np.var(y_true)

        return results
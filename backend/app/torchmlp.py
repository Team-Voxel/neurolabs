import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score, roc_curve, accuracy_score, precision_score, recall_score, f1_score

class TorchMLP:
    def __init__(self, is_classification = True, hidden_layer_sizes=(100,), activation='relu',
                 optimizer='adam', learning_rate=0.001, max_iter=200,
                 batch_size=32, verbose=False, history_size=100, epoch_callback=None, device='cpu'):
        
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
        self.history_size = history_size
        self.epoch_callback = epoch_callback

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
        if self.is_classification:
            # For classification, convert y to long tensor
            if isinstance(y, torch.Tensor):
                y = y.long()
            else:
                y = torch.tensor(y, dtype=torch.long)
            # One-hot encode if needed for multi-class
            if len(y.unique()) > 2:
                n_classes = len(y.unique())
                y_onehot = torch.zeros(len(y), n_classes)
                y_onehot.scatter_(1, y.unsqueeze(1), 1)
                y = y_onehot
        else:
            # For regression, keep as float
            y = torch.tensor(y, dtype=torch.float32)
        
        y = y.to(self.device)
        history_interval = self.max_iter / self.history_size

        if not self.is_classification and len(y.shape) == 1:
            y = y.unsqueeze(1)  # Ensure (N, 1) shape for regression

        # Get output dimension based on problem type
        if self.is_classification:
            output_dim = len(torch.unique(y)) if y.ndim == 1 else y.shape[1]
        else:
            output_dim = 1 if y.ndim == 1 else y.shape[1]

        self._build_model(X.shape[1], output_dim)
        
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

            if epoch % history_interval == 0:
                if self.is_classification:
                    self.model.eval()
                    with torch.no_grad():
                        preds = self.model(X)
                        # Apply softmax for proper probability distribution
                        probs = torch.softmax(preds, dim=1)
                        predicted_classes = probs.argmax(dim=1)
                        if y.ndim > 1:  # One-hot encoded
                            true_classes = y.argmax(dim=1)
                        else:
                            true_classes = y
                        correct = (predicted_classes == true_classes).sum().item()
                        accuracy = correct / len(y)
                else:
                    accuracy = self.score(X.cpu().numpy(), y.cpu().numpy())['r2']

                self.history.append({'loss': avg_loss, 'accuracy': accuracy})

                if self.verbose:
                    print(f"Epoch {epoch+1}/{self.max_iter} - Loss: {avg_loss:.4f}, Accuracy: {accuracy:.4f}")

                if self.epoch_callback:
                    self.epoch_callback(epoch, avg_loss, accuracy)

    def predict(self, X):
        X = torch.tensor(X, dtype=torch.float32).to(self.device)
        self.model.eval()
        with torch.no_grad():
            preds = self.model(X)
            if self.is_classification:
                # Apply softmax for proper probability distribution
                probs = torch.softmax(preds, dim=1)
                return probs.cpu().numpy()
            else:
                return preds.cpu().numpy().squeeze()

    def predict_classes(self, X):
        """Return class predictions for classification problems."""
        if not self.is_classification:
            raise ValueError("predict_classes is only for classification problems")
        probs = self.predict(X)
        return np.argmax(probs, axis=1)

    def get_history(self):
        return self.history

    def score(self, X, y):
        if self.is_classification:
            probs = self.predict(X)
            y_pred_classes = np.argmax(probs, axis=1)
            
            # Convert y to numpy array if it's a tensor
            if isinstance(y, torch.Tensor):
                y_true = y.cpu().numpy()
            else:
                y_true = np.array(y)
            
            # Convert one-hot encoded y to class indices
            if y_true.ndim > 1:
                y_true = np.argmax(y_true, axis=1)

            results = {}
            # Calculate accuracy
            results['accuracy'] = accuracy_score(y_true, y_pred_classes, normalize=True)

            # Calculate precision, recall, F1 score with proper averaging for multiclass
            results['precision'] = precision_score(y_true, y_pred_classes, 
                                                zero_division=0, average='weighted')
            results['recall'] = recall_score(y_true, y_pred_classes, 
                                          zero_division=0, average='weighted')
            results['f1_score'] = f1_score(y_true, y_pred_classes, 
                                         zero_division=0, average='weighted')

            # Calculate confusion matrix
            results['confusion_matrix'] = confusion_matrix(y_true, y_pred_classes).tolist()

            # Calculate ROC AUC for multiclass
            try:
                results['roc_auc'] = roc_auc_score(y_true, probs, 
                                                 multi_class='ovo', 
                                                 average='weighted')
                # Note: ROC curve is not well-defined for multiclass, 
                # so we'll skip it for multiclass problems
                if probs.shape[1] == 2:  # Only for binary classification
                    fpr, tpr, thresholds = roc_curve(y_true, probs[:, 1])
                    results['roc_curve'] = {
                        'fpr': fpr.tolist(), 
                        'tpr': tpr.tolist(), 
                        'thresholds': thresholds.tolist()
                    }
                else:
                    results['roc_curve'] = None
            except:
                results['roc_auc'] = None
                results['roc_curve'] = None

            return results
        else:
            preds = self.predict(X)
            y_true = np.array(y)
            
            # Regression metrics
            results = {}
            results['r2'] = 1.0 - np.mean((preds - y_true) ** 2) / np.var(y_true)
            results['mse'] = np.mean((preds - y_true) ** 2)
            results['mae'] = np.mean(np.abs(preds - y_true))
            
            return results
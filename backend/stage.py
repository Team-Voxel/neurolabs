from typing import Dict, List, Any, Iterable
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader


''' 
dnn_config = [
    {
        'type': 'layer_type',
        'param': {
            key : value
        },
    }
]
'''

a = [1, 'abc', 3]

def parse_config_single(single : Dict[str, Any]) -> nn.Module:
    layer_type = single['type']
    params = single['param']

    if layer_type == 'Linear':
        return nn.Linear(**params)
    elif layer_type == 'Conv':
        return nn.Conv1d(**params)
    elif layer_type == 'ConvTranspose':
        return nn.ConvTranspose1d(**params)
    elif layer_type == 'Activation':
        activation_type = params.get('type')
        if activation_type == 'relu':
            return nn.ReLU()
        elif activation_type == 'sigmoid':
            return nn.Sigmoid()
        elif activation_type == 'leaky_relu':
            return nn.LeakyReLU()
        else:
            return nn.Identity()
    elif layer_type == 'BatchNorm':
        return nn.BatchNorm1d(**params)
    elif layer_type == 'Dropout':
        return nn.Dropout(*params)
    elif layer_type == 'Pooling':
        pooling_type = params.get('type')
        if pooling_type == 'max':
            return nn.MaxPool1d(**params)
        elif pooling_type == 'avg':
            return nn.AvgPool1d(**params)
        elif pooling_type == 'global_max':
            return nn.AdaptiveMaxPool1d(**params)
        elif pooling_type == 'global_avg':
            return nn.AdaptiveAvgPool1d(**params)
        else:
            return nn.Identity()
    elif layer_type == 'Flatten':
        return nn.Flatten()
    elif layer_type == 'Softmax':
        return nn.Softmax(dim=params.get('dim', 1))
    elif layer_type == 'Softmin':
        return nn.Softmin(dim=params.get('dim', 1))
    elif layer_type == 'LSTM':
        return nn.LSTM(**params)
    else:
        raise ValueError(f"Unsupported layer type: {layer_type}")


def remove_inline_activations(dnn_config : List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for i in range(len(dnn_config)):
            inline_act = dnn_config[i]['param'].get('activation', 'none')
            if inline_act != 'none':
                dnn_config.insert(i + 1, {
                    'type': 'Activation',
                    'param': {
                        'type': inline_act
                    }
                })
        for layer in dnn_config:
            layer['param'].pop('activation', None)

        return dnn_config




def default_collate(batch):
    """Default collate for tensors."""
    xs, ys = zip(*batch)
    return torch.stack(xs), torch.tensor(ys)


class PandasDataset(Dataset):
    """
    A simple Dataset wrapping a pandas DataFrame.
    Expects feature columns and a label column.
    """
    def __init__(self, df, feature_cols, label_col, transform=None):
        super().__init__()
        self.df = df.reset_index(drop=True)
        self.feature_cols = feature_cols
        self.label_col = label_col
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        x = torch.tensor(row[self.feature_cols].values, dtype=torch.float32)
        y = row[self.label_col]
        # assume y is scalar (classification label or regression target)
        return self.transform(x) if self.transform else x, y


class DNN(nn.Module):
    def __init__(self, dnn_config : List[Dict[str, Any]], name : str):
        super(DNN, self).__init__()
        # Remove inline activations
        dnn_config = remove_inline_activations(dnn_config)
        self.Network = [parse_config_single(layer) for layer in dnn_config]
        self.model_name = name
        self.seqNet = nn.Sequential(*self.Network)

    def forward(self, x):
        return self.seqNet(x)

    def predict(self, x):
        with torch.no_grad():
            return self.forward(x)

    def fit(
        self,
        train_df,
        test_df,
        feature_cols,
        label_col,
        val_df=None,
        batch_size: int = 32,
        lr: float = 1e-3,
        epochs: int = 10,
        optimizer_cls=optim.Adam,
        loss_fn=None,
        device: str = 'cpu'
    ) -> dict:
        """
        Train the model using pandas DataFrames for data.

        Args:
            train_df: pandas.DataFrame for training.
            test_df: pandas.DataFrame for testing.
            feature_cols: list of column names for features.
            label_col: column name for labels.
            val_df: optional pandas.DataFrame for validation.
            batch_size: batch size for DataLoader.
            lr: learning rate.
            epochs: number of epochs.
            optimizer_cls: optimizer class, e.g., torch.optim.SGD.
            loss_fn: loss function; default is CrossEntropyLoss.
            device: device to run training on ('cpu' only here).

        Returns:
            history: dict containing loss and accuracy metrics per epoch.
        """
        # Prepare datasets & loaders
        train_ds = PandasDataset(train_df, feature_cols, label_col)
        train_loader = DataLoader(
            train_ds, batch_size=batch_size, shuffle=True, collate_fn=default_collate
        )

        test_ds = PandasDataset(test_df, feature_cols, label_col)
        test_loader = DataLoader(
            test_ds, batch_size=batch_size, shuffle=False, collate_fn=default_collate
        )

        val_loader = None
        if val_df is not None:
            val_ds = PandasDataset(val_df, feature_cols, label_col)
            val_loader = DataLoader(
                val_ds, batch_size=batch_size, shuffle=False, collate_fn=default_collate
            )

        # Move model to device
        self.to(device)

        # Loss and optimizer
        criterion = loss_fn if loss_fn is not None else nn.CrossEntropyLoss()
        optimizer = optimizer_cls(self.parameters(), lr=lr)

        # Metrics history
        history = {
            'train_loss': [], 'train_acc': [],
            'val_loss': [], 'val_acc': [],
            'test_loss': [], 'test_acc': []
        }

        for epoch in range(1, epochs + 1):
            # Training
            self.train()
            running_loss = 0.0
            correct = 0
            total = 0
            for x_batch, y_batch in train_loader:
                x_batch, y_batch = x_batch.to(device), y_batch.to(device)
                optimizer.zero_grad()
                outputs = self(x_batch)
                loss = criterion(outputs, y_batch)
                loss.backward()
                optimizer.step()

                running_loss += loss.item() * x_batch.size(0)
                preds = outputs.argmax(dim=1)
                correct += (preds == y_batch).sum().item()
                total += y_batch.size(0)

            epoch_loss = running_loss / total
            epoch_acc = correct / total
            history['train_loss'].append(epoch_loss)
            history['train_acc'].append(epoch_acc)

            # Validation (optional)
            if val_loader:
                self.eval()
                val_loss, val_acc = self._evaluate(val_loader, criterion, device)
                history['val_loss'].append(val_loss)
                history['val_acc'].append(val_acc)

            # Testing
            self.eval()
            test_loss, test_acc = self._evaluate(test_loader, criterion, device)
            history['test_loss'].append(test_loss)
            history['test_acc'].append(test_acc)

        return history

    def _evaluate(self, loader, criterion, device):
        """
        Helper for evaluation on validation/test sets.
        Returns (loss, accuracy).
        """
        running_loss = 0.0
        correct = 0
        total = 0
        with torch.no_grad():
            for x_batch, y_batch in loader:
                x_batch, y_batch = x_batch.to(device), y_batch.to(device)
                outputs = self(x_batch)
                loss = criterion(outputs, y_batch)
                running_loss += loss.item() * x_batch.size(0)
                preds = outputs.argmax(dim=1)
                correct += (preds == y_batch).sum().item()
                total += y_batch.size(0)

        return running_loss / total, correct / total

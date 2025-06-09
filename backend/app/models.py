from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
from dataclasses import dataclass
from abc import ABC, abstractmethod
import sklearn.svm as sv
import sklearn.tree as tree
import sklearn.ensemble as ensemble
import sklearn.neighbors as neighbors
import sklearn.linear_model as lm
from sklearn.neural_network import MLPClassifier, MLPRegressor
from torchmlp import TorchMLPClassifier, TorchMLPRegressor, _BaseMLP
from safe_csv import safe_read_csv
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    mean_squared_error,
    r2_score,
    mean_absolute_error
)
from sklearn.model_selection import train_test_split
from sklearn.base import BaseEstimator
from sklearn.exceptions import NotFittedError

@dataclass
class ModelConfig:
    """Configuration for model creation and training."""
    model_type: str
    epochs: int = 100
    batch_size: int = 32
    learning_rate: float = 0.001
    regularization: str = 'l2'
    kernel: str = 'rbf'
    C: float = 1.0
    max_depth: Optional[int] = None
    criterion: str = 'gini'
    n_neighbors: int = 5
    metric: str = 'minkowski'
    n_estimators: int = 100
    hidden_layers: Tuple[int, ...] = (100,)
    activation: str = 'relu'
    optimizer: str = 'adam'
    wf_dir: str = ''
    problem_type: str = 'classify'
    dataset_size: int = 1000

    def __post_init__(self):
        self._validate()
    
    def _validate(self):
        """Validate the configuration parameters."""
        if self.epochs < 1:
            raise ValueError("Epochs must be greater than 0")
        
        valid_model_types = {'nn', 'svm', 'tree', 'forest', 'knn', 'logistic'}
        if self.model_type not in valid_model_types:
            raise ValueError(f"Invalid model_type. Must be one of {valid_model_types}")

        # Model-specific validation
        if self.model_type == 'logistic':
            if self.regularization not in ['l1', 'l2', 'elasticnet']:
                raise ValueError("Invalid regularization for logistic regression")
        elif self.model_type == 'svm':
            if self.kernel not in ['linear', 'rbf', 'poly', 'sigmoid']:
                raise ValueError("Invalid kernel for SVM")
        elif self.model_type in ['tree', 'forest']:
            if self.criterion not in ['gini', 'entropy']:
                raise ValueError("Invalid criterion for tree-based models")
        elif self.model_type == 'knn':
            if self.metric not in ['euclidean', 'manhattan', 'minkowski']:
                raise ValueError("Invalid metric for KNN")

    @classmethod
    def from_dict(cls, config: Dict[str, Any]) -> 'ModelConfig':
        """Create ModelConfig from frontend configuration."""
        return cls(
            model_type=config['model_type'],
            epochs=config.get('epochs', 100),
            batch_size=config.get('batchSize', 32),
            learning_rate=config.get('learningRate', 0.001),
            regularization=config.get('regularization', 'l2'),
            kernel=config.get('kernel', 'rbf'),
            C=config.get('C', 1.0),
            max_depth=config.get('maxDepth'),
            criterion=config.get('criterion', 'gini'),
            n_neighbors=config.get('nNeighbors', 5),
            metric=config.get('metric', 'minkowski'),
            n_estimators=config.get('nEstimators', 100),
            hidden_layers=config.get('hiddenLayers', (100,)),
            activation=config.get('activation', 'relu'),
            optimizer=config.get('optimizer', 'adam'),
            wf_dir=config.get('wfDir', ''),
            problem_type=config.get('problemType', 'classify'),
            dataset_size=config.get('datasetSize', 1000)
        )

class ModelFactory:
    """Factory class for creating machine learning models."""
    
    @staticmethod
    def create_model(config: ModelConfig) -> BaseEstimator:
        """Create a model based on the provided configuration."""
        if config.model_type == 'nn':
            return ModelFactory._create_neural_network(config)
        elif config.problem_type == 'classify':
            return ModelFactory._create_classifier(config)
        else:
            return ModelFactory._create_regressor(config)

    @staticmethod
    def _create_neural_network(config: ModelConfig) -> Union[TorchMLPClassifier, TorchMLPRegressor, MLPClassifier, MLPRegressor]:
        if config.problem_type == 'classify':
            if config.dataset_size < 5000:
                return MLPClassifier(
                    hidden_layer_sizes=config.hidden_layers,
                    activation= 'relu' if config.activation == 'leaky_relu' else config.activation,
                    solver= 'adam' if config.optimizer == 'adam' else 'lbfgs',
                    learning_rate_init=config.learning_rate,
                    max_iter=config.epochs,
                    batch_size=config.batch_size
                )
            return TorchMLPClassifier(
                hidden_layer_sizes=config.hidden_layers,
                activation=config.activation,
                optimizer=config.optimizer,
                learning_rate_init=config.learning_rate,
                max_iter=config.epochs,
                batch_size=config.batch_size
            )
        else:
            if config.dataset_size < 5000:
                return MLPRegressor(
                    hidden_layer_sizes=config.hidden_layers,
                    activation= 'relu' if config.activation == 'leaky_relu' else config.activation,
                    solver= 'adam' if config.optimizer == 'adam' else 'lbfgs',
                    learning_rate_init=config.learning_rate,
                    max_iter=config.epochs,
                    batch_size=config.batch_size
                )
            return TorchMLPRegressor(
                is_classification=False,
                hidden_layer_sizes=config.hidden_layers,
                activation=config.activation,
                optimizer=config.optimizer,
                learning_rate=config.learning_rate,
                max_iter=config.epochs,
                batch_size=config.batch_size
            )

    @staticmethod
    def _create_classifier(config: ModelConfig) -> BaseEstimator:
        model_map = {
            'svm': lambda: sv.SVC(
                kernel=config.kernel,
                C=config.C,
                gamma='scale',
                max_iter=config.epochs
            ),
            'tree': lambda: tree.DecisionTreeClassifier(
                criterion=config.criterion,
                max_depth=config.max_depth
            ),
            'forest': lambda: ensemble.RandomForestClassifier(
                criterion=config.criterion,
                n_estimators=config.n_estimators,
                max_depth=config.max_depth
            ),
            'knn': lambda: neighbors.KNeighborsClassifier(
                n_neighbors=config.n_neighbors,
                metric=config.metric
            ),
            'logistic': lambda: lm.LogisticRegression(
                penalty=config.regularization,
                solver='lbfgs',
                max_iter=config.epochs
            ),
            'gb': lambda: ensemble.GradientBoostingClassifier(
                loss='log_loss',
                n_estimators=config.n_estimators,
                max_depth=config.max_depth,
                learning_rate=config.learning_rate
            )
        }
        
        if config.model_type not in model_map:
            raise ValueError(f"Unsupported classifier type: {config.model_type}")
        
        return model_map[config.model_type]()

    @staticmethod
    def _create_regressor(config: ModelConfig) -> BaseEstimator:
        params = config.params
        model_map = {
            'svm': lambda: sv.SVR(
                kernel=params.get("kernel", "rbf"),
                C=params.get("C", 1.0),
                epsilon=params.get("epsilon", 0.1),
                gamma=params.get("gamma", 'scale'),
                max_iter=config.epochs
            ),
            'tree': lambda: tree.DecisionTreeRegressor(
                criterion=params.get("criterion", "mse"),
                max_depth=params.get("max_depth", None)
            ),
            'forest': lambda: ensemble.RandomForestRegressor(
                criterion=params.get("criterion", "mse"),
                n_estimators=params.get("n_estimators", 100),
                max_depth=params.get("max_depth", None)
            ),
            'knn': lambda: neighbors.KNeighborsRegressor(
                n_neighbors=params.get("n_neighbors", 5),
                metric=params.get("metric", 'minkowski')
            ),
            'linear': lambda: ModelFactory._create_linear_regressor(config),
            'gb': lambda: ensemble.GradientBoostingRegressor(
                loss=config.get('loss', 'squared_error'),
                n_estimators=params.get("n_estimators", 100),
                max_depth=params.get("max_depth", None),
                learning_rate=params.get("learning_rate", 0.1)
            )
        }
        
        if config.model_type not in model_map:
            raise ValueError(f"Unsupported regressor type: {config.model_type}")
        
        return model_map[config.model_type]()

    @staticmethod
    def _create_linear_regressor(config: ModelConfig) -> BaseEstimator:
        params = config.params
        loss = params.get("loss", "squared_loss")
        optimizer = params.get("optimizer", "analytical")
        regularization = params.get("regularization", "l2")
        
        if optimizer == "sgd":
            return lm.SGDRegressor(
                loss=loss,
                penalty=regularization,
                max_iter=config.epochs
            )
        
        if loss == "squared_loss":
            if regularization == "l2":
                return lm.Ridge(
                    alpha=params.get("alpha", 1.0),
                    max_iter=config.epochs
                )
            elif regularization == "l1":
                return lm.Lasso(
                    alpha=params.get("alpha", 1.0),
                    max_iter=config.epochs
                )
            elif regularization == "elasticnet":
                return lm.ElasticNet(
                    alpha=params.get("alpha", 1.0),
                    l1_ratio=params.get("l1_ratio", 0.5),
                    max_iter=config.epochs
                )
        elif loss == "huber":
            return lm.HuberRegressor(
                alpha=params.get("alpha", 1.0),
                max_iter=config.epochs
            )
        
        raise ValueError(f"Unsupported loss function: {loss}")

class ModelTrainer:
    """Class for training and evaluating machine learning models."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the trainer with configuration."""
        self.config = ModelConfig.from_dict(config)
        self.model : BaseEstimator | _BaseMLP = None
        self.X = None
        self.y = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
    
    def prepare_data(self) -> None:
        """Load and prepare the data for training."""
        df = safe_read_csv(self.config.wf_dir)
        if df is None or df.empty:
            raise ValueError("No data available for training")
            
        self.X = df.iloc[:, :-1].values
        self.y = df.iloc[:, -1].values
        
        if len(self.X) < 2:
            raise ValueError("Insufficient data for training")
            
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X, self.y, test_size=0.2, random_state=42
        )
    
    def train(self) -> None:
        """Train the model with the prepared data."""
        if self.X_train is None or self.y_train is None:
            raise ValueError("Data not prepared. Call prepare_data() first")
            
        self.model = ModelFactory.create_model(self.config)
        self.model.fit(self.X_train, self.y_train)
    
    def evaluate(self) -> Dict[str, Any]:
        """Evaluate the trained model and return metrics."""
        if not self.model:
            raise ValueError("Model not trained. Call train() first")
            
        try:
            y_pred = self.model.predict(self.X_test)
        except NotFittedError:
            raise ValueError("Model not fitted. Call train() first")
            
        # Calculate metrics
        if self.config.problem_type == 'classify':
            metrics = {
                'accuracy': float(accuracy_score(self.y_test, y_pred)),
                'precision': float(precision_score(self.y_test, y_pred, average='weighted')),
                'recall': float(recall_score(self.y_test, y_pred, average='weighted')),
                'f1Score': float(f1_score(self.y_test, y_pred, average='weighted')),
                'confusionMatrix': self.format_confusion_matrix(confusion_matrix(self.y_test, y_pred)),
                'baseAccuracy': float(self._calculate_base_accuracy())
            }
            # Add model-specific metrics
            metrics.update(self._get_model_specific_metrics())
            
            # Add decision boundary if 2D data
            if self.X.shape[1] == 2:
                metrics.update(self._calculate_decision_boundary())
        else:
            metrics = {
                'r2': float(r2_score(self.y_test, y_pred)),
                'mse': float(mean_squared_error(self.y_test, y_pred)),
                'rmse': float(np.sqrt(mean_squared_error(self.y_test, y_pred))),
                'mae': float(mean_absolute_error(self.y_test, y_pred)),
            }
        
        return metrics
    
    def format_confusion_matrix(self, confusion_matrix: np.ndarray) -> Dict[str, Any]:
        """
        Format the multiclass confusion matrix to include the class labels.
        [
            {
                'name': 'Class 1',
                'data': [
                    {
                        'name': 'Class 1',
                        'value': 10
                    },
                    {
                        'name': 'Class 2',
                        'value': 20
                    },
                    ...
                ]
            },
            {
                'name': 'Class 2',
                'data': [
                    {
                        'name': 'Class 1',
                        'value': 10
                    },
                    {
                        'name': 'Class 2',
                        'value': 20
                    },
                    ...
                ]
            },
            ...
        ]
        """
        class_labels = np.unique(self.y_test)
        formatted_matrix = []
        for i in range(len(class_labels)):
            row = {
                'name': f'Class {i+1}',
                'data': []
            }
            for j in range(len(class_labels)):
                row['data'].append({
                    'name': f'Class {j+1}',
                    'value': int(confusion_matrix[i, j])
                })
            formatted_matrix.append(row)
        return formatted_matrix
    
    def _calculate_base_accuracy(self) -> float:
        """Calculate the base accuracy (majority class prediction)."""
        majority_class = np.argmax(np.bincount(self.y_train))
        return accuracy_score(self.y_test, np.full_like(self.y_test, majority_class))
    
    def _get_model_specific_metrics(self) -> Dict[str, Any]:
        """Get model-specific metrics like coefficients or support vectors."""
        metrics = {
            'trainedCoefficients': None,
            'trainedIntercept': None,
            'trainedSupportVectors': None
        }
        
        if self.config.model_type == 'logistic':
            metrics.update({
                'trainedCoefficients': self.model.coef_.tolist(),
                'trainedIntercept': self.model.intercept_.tolist()
            })
        elif self.config.model_type == 'svm':
            metrics['trainedSupportVectors'] = self.model.support_vectors_.tolist()
            
        return metrics
    
    def _calculate_decision_boundary(self) -> Dict[str, Any]:
        """Calculate decision boundary for 2D data."""
        x_min, x_max = self.X[:, 0].min() - 1, self.X[:, 0].max() + 1
        y_min, y_max = self.X[:, 1].min() - 1, self.X[:, 1].max() + 1
        xx, yy = np.meshgrid(np.linspace(x_min, x_max, 50), np.linspace(y_min, y_max, 50))
        grid_points = np.c_[xx.ravel(), yy.ravel()]
        
        if hasattr(self.model, 'predict_proba'):
            Z_prob = self.model.predict_proba(grid_points)
            predicted_classes = np.argmax(Z_prob, axis=1)
        else:
            predicted_classes = self.model.predict(grid_points)
        
        return {
            'decisionBoundary': grid_points.tolist(),
            'predictedClasses': predicted_classes.tolist()
        }

def make_train_and_evaluate_model(config: Dict[str, Any]) -> Dict[str, Any]:
    """Main function to train and evaluate a model."""
    try:
        trainer = ModelTrainer(config)
        trainer.prepare_data()
        trainer.train()
        return trainer.evaluate()
    except Exception as e:
        raise RuntimeError(f"Error in model training and evaluation: {e}")


def create_train_save_model(config: Dict[str, Any]) -> Dict[str, Any]:
    """Main function to create, train and save a model."""
    try:
        trainer = ModelTrainer(config)
        trainer.prepare_data()
        trainer.train()
        evalution = trainer.evaluate()
        from serialize import save_model, load_metadata_object, save_metadata_object
        metadata = load_metadata_object(config['wfDir'])
        save_model(trainer.model, config['modelName'], metadata, config['wfDir'], evalution, trainer.config)
        save_metadata_object(metadata, config['wfDir'])
    except Exception as e:
        raise RuntimeError(f"Error in model creation, training and saving: {str(e)}")
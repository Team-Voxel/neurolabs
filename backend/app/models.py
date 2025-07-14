from typing import Dict, Any, List, Optional, Tuple, Union
import pandas as pd
import numpy as np
from dataclasses import dataclass
from sklearn.decomposition import PCA
from sklearn.naive_bayes import GaussianNB
import sklearn.svm as sv
import sklearn.tree as tree
import sklearn.ensemble as ensemble
import sklearn.neighbors as neighbors
import sklearn.linear_model as lm
from sklearn.neural_network import MLPClassifier, MLPRegressor
from torchmlp import TorchMLPClassifier, TorchMLPRegressor, _BaseMLP
import time
from sklearn.preprocessing import label_binarize
from safe_csv import safe_read_csv
from json_sanitizer import sanitize_for_json
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    mean_squared_error,
    r2_score,
    mean_absolute_error,
    auc,
    roc_curve,
    roc_auc_score,
    precision_recall_curve,
    average_precision_score
)
from sklearn.model_selection import learning_curve, validation_curve
from sklearn.model_selection import train_test_split
from sklearn.base import BaseEstimator
from sklearn.exceptions import NotFittedError
from arlinear import ARLinearRegressor

def compute_macro_roc_pr_curves(
    y_true: Union[np.ndarray, list],
    y_scores: Union[np.ndarray, list],
    num_classes: int
) -> Dict[str, Any]:
    """
    Compute macro-averaged ROC and Precision-Recall curve data robustly,
    only considering classes present in y_true.
    
    Parameters:
        y_true: Ground truth labels (1D array-like)
        y_scores: Predicted probabilities or decision function (2D or 1D)
        num_classes: Total number of classes in the full dataset.

    Returns:
        Dictionary with ROC/PR curve data and AUC/AP scores.
    """
    y_true = np.array(y_true)
    y_scores = np.array(y_scores)

    is_multiclass = num_classes > 2

    if is_multiclass:
        # Binarize labels against ALL possible classes to keep indices consistent
        # with y_scores columns.
        y_true_bin = label_binarize(y_true, classes=np.arange(num_classes))
        
        if y_scores.ndim != 2 or y_scores.shape[1] != num_classes:
            raise ValueError(
                "For multiclass, y_scores must be a 2D array with shape (n_samples, n_classes)"
            )

        present_class_indices = np.where(y_true_bin.sum(axis=0) > 0)[0]
        
        # If no classes are present, return default values
        if len(present_class_indices) == 0:
            return {
                'rocX': [0., 1.], 'rocY': [0., 1.],
                'prX': [0., 1.], 'prY': [1., 0.],
                'rocAuc': 0.5, 'averagePrecision': 0.0
            }

        # Interpolate ROC curves for each PRESENT class onto a common axis
        all_fpr = np.unique(np.concatenate(
            [roc_curve(y_true_bin[:, i], y_scores[:, i])[0] for i in present_class_indices]
        ))
        
        mean_tpr = np.zeros_like(all_fpr)
        for i in present_class_indices:
            fpr_i, tpr_i, _ = roc_curve(y_true_bin[:, i], y_scores[:, i])
            mean_tpr += np.interp(all_fpr, fpr_i, tpr_i)
        
        mean_tpr /= len(present_class_indices)

        # Interpolate PR curves for each PRESENT class onto a common axis
        all_recall = np.linspace(0, 1, 101)
        mean_precision = np.zeros_like(all_recall)
        for i in present_class_indices:
            prec_i, rec_i, _ = precision_recall_curve(y_true_bin[:, i], y_scores[:, i])
            # Reverse recall to be increasing for interpolation
            mean_precision += np.interp(all_recall, rec_i[::-1], prec_i[::-1])
        
        mean_precision /= len(present_class_indices)

        return {
            'rocX': all_fpr.tolist(),
            'rocY': mean_tpr.tolist(),
            'prX': all_recall.tolist(),
            'prY': mean_precision.tolist(),
            'rocAuc': float(roc_auc_score(y_true_bin, y_scores, average='macro', multi_class='ovr')),
            'averagePrecision': float(average_precision_score(y_true_bin, y_scores, average='macro'))
        }

    else: # Binary case
        if y_scores.ndim == 2:
            y_scores_bin = y_scores[:, 1]
        else:
            y_scores_bin = y_scores

        fpr, tpr, _ = roc_curve(y_true, y_scores_bin)
        precision, recall, _ = precision_recall_curve(y_true, y_scores_bin)

        return {
            'rocX': fpr.tolist(),
            'rocY': tpr.tolist(),
            'prX': recall.tolist(),
            'prY': precision.tolist(),
            'rocAuc': float(roc_auc_score(y_true, y_scores_bin)),
            'averagePrecision': float(average_precision_score(y_true, y_scores_bin))
        }

@dataclass
class ModelConfig:
    """Configuration for model creation and training."""
    model_type: str
    epochs: int = 100
    batch_size: int = 32
    learning_rate: float = 0.001
    regularization: str = 'none'
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
    min_samples_split: int = 2
    l1_ratio: float = 0.5
    params: Dict[str, Any] = None  # All parameters included and not included as fields

    def __post_init__(self):
        self._validate()
    
    def _validate(self):
        """Validate the configuration parameters."""
        if self.epochs < 1:
            raise ValueError("Epochs must be greater than 0")
        
        valid_model_types = {'nn', 'svm', 'tree', 'forest', 'knn', 'logistic', 'gb', 'nb', 'linear_fs', 'linear_simple', 'logistic_fs', 'logistic_simple'}

        if self.model_type not in valid_model_types:
            raise ValueError(f"Invalid model_type. Must be one of {valid_model_types}")
        
        if self.problem_type not in {'classify', 'regress'}:
            raise ValueError("Problem type must be 'classify' or 'regress'")

        # Model-specific validation
        if self.model_type == 'logistic' or self.model_type == 'logistic_simple' or self.model_type == 'logistic_fs':
            if self.regularization not in ['l1', 'l2', 'elasticnet', 'none']:
                raise ValueError("Invalid regularization for logistic regression")
        elif self.model_type == 'linear_fs' or self.model_type == 'linear_simple' or self.model_type == 'linear':
            if self.regularization not in ['none', 'ridge', 'lasso', 'elasticnet', 'lars']:
                raise ValueError("Invalid regularization for linear regression")
            if self.optimizer not in ['sgd', 'analytical']:
                raise ValueError("Invalid optimizer for linear regression")
            if self.epochs < 1:
                raise ValueError("Epochs must be greater than 0 for linear regression")
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
            regularization=config.get('regularization', 'none'),
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
            dataset_size=config.get('datasetSize', 1000),
            min_samples_split=config.get('minSamplesSplit', 2),
            l1_ratio=config.get('l1Ratio', 0.5),
            params=config
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
                    activation= 'relu' if config.activation == 'leakyrelu' else config.activation,
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
                    activation= 'relu' if config.activation == 'leakyrelu' else config.activation,
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
                max_depth=config.max_depth,
                min_samples_split=config.min_samples_split
            ),
            'forest': lambda: ensemble.RandomForestClassifier(
                criterion=config.criterion,
                n_estimators=config.n_estimators,
                max_depth=config.max_depth,
                min_samples_split=config.min_samples_split
            ),
            'knn': lambda: neighbors.KNeighborsClassifier(
                n_neighbors=config.n_neighbors,
                metric=config.metric
            ),
            'logistic': lambda: lm.LogisticRegression(
                penalty=None if config.regularization == 'none' else config.regularization,
                solver='lbfgs' if config.regularization == 'l2' else 'saga',
                max_iter=config.epochs,
                C=1.0/config.params.get('alpha', 1.0), # Inverse of regularization strength
                l1_ratio=config.l1_ratio
            ),
            'logistic_simple': lambda: ModelFactory._create_logistic_regressor(config),
            'logistic_fs': lambda: lm.LogisticRegression(
                penalty=None if config.regularization == 'none' else config.regularization,
                solver='lbfgs' if config.regularization == 'l2' else 'saga',
                max_iter=config.epochs,
                C=1.0/config.params.get('alpha', 1.0), # Inverse of regularization strength
                l1_ratio=config.l1_ratio
            ),
            'gb': lambda: ensemble.GradientBoostingClassifier(
                loss='log_loss',
                n_estimators=config.n_estimators,
                max_depth=config.max_depth,
                learning_rate=config.learning_rate
            ),
            'nb': lambda: ModelFactory._create_naive_bayes(config),
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
                max_depth=params.get("max_depth", None),
                min_samples_split=params.get("min_samples_split", 2)
            ),
            'forest': lambda: ensemble.RandomForestRegressor(
                criterion=params.get("criterion", "mse"),
                n_estimators=params.get("n_estimators", 100),
                max_depth=params.get("max_depth", None),
                min_samples_split=params.get("min_samples_split", 2)
            ),
            'knn': lambda: neighbors.KNeighborsRegressor(
                n_neighbors=params.get("n_neighbors", 5),
                metric=params.get("metric", 'minkowski')
            ),
            'linear': lambda: ModelFactory._create_linear_regressor(config),
            'gb': lambda: ensemble.GradientBoostingRegressor(
                loss=config.params.get('loss', 'squared_error'),
                n_estimators=params.get("n_estimators", 100),
                max_depth=params.get("max_depth", None),
                learning_rate=params.get("learning_rate", 0.1)
            )
        }
        
        if config.model_type not in model_map:
            raise ValueError(f"Unsupported regressor type: {config.model_type}")
        
        return model_map[config.model_type]()

    @staticmethod
    def _create_logistic_regressor(config: ModelConfig) -> BaseEstimator:
        """Create a logistic regression model."""
        penalty = None if config.regularization == 'none' else config.regularization
        use_sgd = config.params.get("useSGD", False)
        
        if use_sgd:
            return lm.SGDClassifier(
                loss='log',
                penalty=penalty,
                max_iter=config.epochs,
                l1_ratio=config.l1_ratio
            )

        return lm.LogisticRegression(
            penalty=penalty,
            solver='lbfgs' if penalty == 'l2' else 'saga',
            max_iter=config.epochs,
            C=1.0/config.params.get('alpha', 1.0),  # Inverse of regularization strength
            l1_ratio=config.l1_ratio
        )
    
    @staticmethod
    def _create_naive_bayes(config: ModelConfig) -> BaseEstimator:
        """Create a Naive Bayes model."""
        dist = config.params.get("distribution", "gaussian")
        if dist == "gaussian":
            return GaussianNB(var_smoothing=config.params.get("var_smoothing", 1e-9))
        elif dist == "bernoulli":
            from sklearn.naive_bayes import BernoulliNB
            return BernoulliNB(alpha=config.params.get("alpha", 1.0))
        elif dist == "multinomial":
            from sklearn.naive_bayes import MultinomialNB
            return MultinomialNB(alpha=config.params.get("alpha", 1.0))
        else:
            raise ValueError(f"Unsupported Naive Bayes type: {dist}")

    @staticmethod
    def _create_linear_regressor(config: ModelConfig) -> BaseEstimator:
        params = config.params
        loss = params.get("loss", "squared_loss")
        use_sgd = params.get("useSGD", False)
        reg_map = {
            'none': None,
            'ridge': 'l2',
            'lasso': 'l1',
            'elasticnet': 'elasticnet',
            'lars': 'l1',  # or None depending on context
        }
        regularization = params.get("regularization", 'none')

        if use_sgd:
            return lm.SGDRegressor(
                loss=loss,
                penalty=reg_map[regularization],
                max_iter=config.epochs,
                l1_ratio=config.l1_ratio
            )
        
        if loss == "squared_loss":
            return ARLinearRegressor(
                regularization_method=regularization,
                alpha=params.get("alpha", 1.0),
                max_iter=config.epochs,
                l1_ratio=config.l1_ratio
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
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.trainingTime = 0.0
        self.num_classes = 0
    
    def prepare_data(self, X_train, X_test, y_train, y_test) -> None:
        """Initialize with data."""
            
        if len(X_train) < 2:
            raise ValueError("Insufficient data for training")
        
        self.num_classes = len(set(y_train))

        self.X_train = X_train.to_numpy()
        self.X_test = X_test.to_numpy()
        self.y_train = y_train.to_numpy().ravel().astype(int)
        self.y_test = y_test.to_numpy().ravel().astype(int)
    
    def train(self) -> None:
        """Train the model with the prepared data."""
        if self.X_train is None or self.y_train is None:
            raise ValueError("Data not prepared. Call prepare_data() first")
        
        start_time = time.time()
        self.model = ModelFactory.create_model(self.config)
        self.model.fit(self.X_train, self.y_train)
        end_time = time.time()
        self.trainingTime = (end_time - start_time) * 1000
    
    def evaluate(self, advanced_metrics: bool = True, compute_decision_boundary: bool = False) -> Dict[str, Any]:
        """Evaluate the trained model and return metrics."""
        if not self.model:
            raise ValueError("Model not trained. Call train() first")
            
        try:
            y_pred = self.model.predict(self.X_test)
        except NotFittedError:
            raise ValueError("Model not fitted. Call train() first")
            
        # Calculate metrics
        if self.config.problem_type == 'classify':
            
            # Base classification metrics
            metrics = {
                'accuracy': float(accuracy_score(self.y_test, y_pred)),
                'precision': float(precision_score(self.y_test, y_pred, average='weighted')),
                'recall': float(recall_score(self.y_test, y_pred, average='weighted')),
                'f1Score': float(f1_score(self.y_test, y_pred, average='weighted')),
                'confusionMatrix': self.normalize_confusion_matrix(confusion_matrix(self.y_test, y_pred)).tolist(),
                'classes': [f'Class {i}' for i in range(len(np.unique(self.y_test)))],
                'baseAccuracy': float(self._calculate_base_accuracy()),
            }

            # Proba specific metrics (requires predict proba. Not avalable in some models)
            if hasattr(self.model, "predict_proba") and advanced_metrics:
                metrics.update(compute_macro_roc_pr_curves(self.y_test, self.model.predict_proba(self.X_test), self.num_classes))
            # Add model-specific metrics
            metrics.update(self._get_model_specific_metrics())
            
            # Add decision boundary if 2D data
            if self.X_train.shape[1] == 2 or compute_decision_boundary:
                metrics.update(self._calculate_decision_boundary())
        else:
            metrics = {
                'r2': float(r2_score(self.y_test, y_pred)),
                'mse': float(mean_squared_error(self.y_test, y_pred)),
                'rmse': float(np.sqrt(mean_squared_error(self.y_test, y_pred))),
                'mae': float(mean_absolute_error(self.y_test, y_pred)),
                'residuals': (self.y_test - y_pred).tolist(),
                'yTest': self.y_test.tolist(),
                'yPred': y_pred.tolist()
            }

        if advanced_metrics:
            train_sizes, train_scores, test_scores = learning_curve(
                self.model, self.X_train, self.y_train, cv=5, scoring='accuracy' if self.config.problem_type == 'classify' else 'r2',
                train_sizes=np.linspace(0.1, 1.0, 5)
            )

            metrics['learningCurve'] = {
                'trainSizes': train_sizes.tolist(),
                'trainScoresMean': train_scores.mean(axis=1).tolist(),
                #'trainScoresStd': train_scores.std(axis=1).tolist(),
                'testScoresMean': test_scores.mean(axis=1).tolist(),
                #'testScoresStd': test_scores.std(axis=1).tolist()
            }
        
        metrics['trainingTime'] = self.trainingTime
        metrics['problemType'] = self.config.problem_type

        return metrics
    
    def normalize_confusion_matrix(self, confusion_matrix: np.ndarray) -> np.ndarray:
        """
        Normalize the confusion matrix to include the class labels.
        """
        return confusion_matrix / confusion_matrix.sum(axis=1, keepdims=True)
    
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
                    'value': float(confusion_matrix[i, j])
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
        """Calculate decision boundary for 2D data with optional jitter."""

        pca = None
        if self.X_train.shape[1] == 2:
            x_min, x_max = float(self.X_train[:, 0].min() - 1), float(self.X_train[:, 0].max() + 1)
            y_min, y_max = float(self.X_train[:, 1].min() - 1), float(self.X_train[:, 1].max() + 1)
        else:
            pca = PCA(2)
            reduced_x_train = pca.fit_transform(self.X_train)
            x_min, x_max = float(reduced_x_train[:, 0].min() - 1), float(reduced_x_train[:, 0].max() + 1)
            y_min, y_max = float(reduced_x_train[:, 1].min() - 1), float(reduced_x_train[:, 1].max() + 1)

        grid_size = 50
        jitter_strength = 0.1 * ((x_max - x_min) / grid_size)  # ~10% of grid step size

        xx, yy = np.meshgrid(
            np.linspace(x_min, x_max, grid_size),
            np.linspace(y_min, y_max, grid_size)
        )
        
        grid_points = np.c_[xx.ravel(), yy.ravel()]

        rng = np.random.default_rng(seed=42)  # consistent jitter across runs
        jitter = rng.normal(loc=0.0, scale=jitter_strength, size=grid_points.shape)
        jittered_points = grid_points + jitter

        if self.X_train.shape[1] != 2:
            compute_points = pca.inverse_transform(jittered_points)
        else:
            compute_points = jittered_points
        
        if hasattr(self.model, 'predict_proba'):
            Z_prob = self.model.predict_proba(compute_points)
            if len(Z_prob.shape) == 2 and Z_prob.shape[1] > 1:
                predicted_classes = np.argmax(Z_prob, axis=1)
            else:
                predicted_classes = (Z_prob > 0.5).astype(int)
        else:
            predicted_classes = self.model.predict(compute_points)
        
        
        """ if pca != None:
            predicted_classes = pca.transform(predicted_classes) """

        return {
            'decisionBoundary': jittered_points.tolist(),
            'predictedClasses': predicted_classes.tolist()
        }

def make_train_and_evaluate_model(config: Dict[str, Any]) -> Dict[str, Any]:
    """Main function to train and evaluate a model."""
    try:
        trainer = ModelTrainer(config)
        df = safe_read_csv(config['wfDir']) # here wfDir is the path to the CSV file containing the dataset
        if df.empty:
            raise ValueError("Dataset is empty. Please provide a valid dataset.")
        X = df.drop(columns=['y'])
        y = df['y']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=65)

        trainer.prepare_data(X_train=X_train, X_test=X_test, y_train=y_train, y_test=y_test)
        trainer.train()
        
        evaluation = trainer.evaluate(advanced_metrics=False, compute_decision_boundary=True)
        return evaluation
    except Exception as e:
        raise RuntimeError(f"Error in model training and evaluation: {e.__str__()}")


def create_train_save_model(config: Dict[str, Any]) -> Dict[str, Any]:
    """Main function to create, train and save a model."""
    try:
        param_conf : dict[str, any] = config['parameters']
        param_conf['epochs'] = config['epochs']
        param_conf['model_type'] = config['modelType']
        trainer = ModelTrainer(param_conf)
        # measure time to train the model
        # Load data
        dataDir = config['wfDir']
        X_train = safe_read_csv(dataDir + '\\Xtrain.csv')
        X_test = safe_read_csv(dataDir + '\\Xtest.csv')
        y_train = safe_read_csv(dataDir + '\\ytrain.csv')
        y_test = safe_read_csv(dataDir + '\\ytest.csv')

        trainer.prepare_data(X_train=X_train, X_test=X_test, y_train=y_train, y_test=y_test)
        trainer.train()

        evaluation = trainer.evaluate(advanced_metrics=True, compute_decision_boundary=True)
        score = f'R2: {evaluation["r2"]}' if trainer.config.problem_type == 'regress' else f'Accuracy: {evaluation["accuracy"]}'
        evaluation = sanitize_for_json(evaluation)
        from serialize import save_model, load_metadata_object, save_metadata_object, save_model_training_data
        metadata = load_metadata_object(config['wfDir'])
        save_model(model=trainer.model, 
                   config=trainer.config,
                   model_type=config['modelType'], 
                   metadata_dict=metadata, 
                   save_dir=config['wfDir'], 
                   baseMetric=score, 
                   hyperparameters=config['parameters'])
        save_metadata_object(metadata, config['wfDir'])
        save_model_training_data(config['modelType'], evaluation, config['wfDir'])

        return evaluation
    except Exception as e:
        raise RuntimeError(f"Error in model creation, training and saving: {e.__str__()}")
    
from serialize import load_model, load_metadata_object
from sklearn.preprocessing import LabelEncoder
from sklearn.compose import ColumnTransformer
import os
import joblib

def load_model_and_infer(config: dict[str, any]):
    

    model_type = config['modelType']
    wfDir = config['wfDir']
    metadata_dict = load_metadata_object(wfDir)
    model, model_config = load_model(model_type=model_type, metadata_dict=metadata_dict)

    preprocessor_path = wfDir + '\\preprocessor.joblib'
    target_encoder_path = wfDir + '\\target_encoder.joblib'


    preprocessor : ColumnTransformer = joblib.load(preprocessor_path)

    X_pred = config['xPred']

    input_df = pd.DataFrame([X_pred])
    features = input_df.columns.tolist()
    input_df = input_df[features]
    """ input_arr = input_df.to_numpy()
    print(input_arr) """
    X_pred = preprocessor.transform(input_df)

    y_pred = model.predict(X_pred)

    if os.path.exists(target_encoder_path):
        target_enc : LabelEncoder = joblib.load(target_encoder_path)
        y_pred = target_enc.inverse_transform(y_pred)[0]

    return {'prediction': f'{y_pred}'}
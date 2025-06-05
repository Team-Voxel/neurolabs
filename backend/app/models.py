import sklearn.svm as sv
import sklearn.tree as tree
import sklearn.ensemble as ensemble
import sklearn.neighbors as neighbors
import sklearn.linear_model as lm
import sklearn.neural_network as nn
from torchmlp import TorchMLP
from safe_csv import safe_read_csv
import numpy as np
from sklearn.metrics import confusion_matrix   

def create_model(config):
    """
    Create a machine learning model based on the provided configuration.
    
    Args:
        config (dict): Configuration dictionary containing model type and parameters.
        
    Returns:
        model: An instance of the specified machine learning model.
    """
    size = config.get("size", "small") # Size of the dataset. Used to determine algorithm

    model_type = config.get("model_type")
    problem_type = config.get("problem_type")
    params : dict = config.get("params", {})
    epochs = config.get("epochs", 100)
    model = None

    if model_type == 'nn':
        model = TorchMLP(is_classification=(problem_type == 'classify'),
                         hidden_layer_sizes=params.get("hidden_layer_sizes", (100,)),
                         activation=params.get("activation", "relu"),
                         optimizer=params.get("optimizer", "adam"),
                         learning_rate=params.get("learning_rate", 0.001),
                         max_iter=epochs,
                         batch_size=params.get("batch_size", 32))
        
    

    if problem_type == 'regress':
        if model_type == 'svm':
            model = sv.SVR(kernel=params.get("kernel", "rbf"),
                          C=params.get("C", 1.0),
                          epsilon=params.get("epsilon", 0.1),
                          gamma=params.get("gamma", 'scale'), max_iter=epochs)
        elif model_type == 'tree':
            model = tree.DecisionTreeRegressor(criterion=params.get("criterion", "mse"),
                                               max_depth=params.get("max_depth", None), max_iter=epochs)
        elif model_type == 'forest':
            model = ensemble.RandomForestRegressor(criterion=params.get("criterion", "mse"),
                                                   n_estimators=params.get("n_estimators", 100),
                                                   max_depth=params.get("max_depth", None), max_iter=epochs)
        elif model_type == 'knn':
            model = neighbors.KNeighborsRegressor(n_neighbors=params.get("n_neighbors", 5),
                                                   weights=params.get("weights", 'uniform'),
                                                   metric=params.get("metric", 'minkowski'),
                                                   p=params.get("p", 2), max_iter=epochs)
        elif model_type == 'linear':
            loss = params.get("loss", "squared_loss")
            optimizer = params.get("optimizer", "analytical")
            regularization = params.get("regularization", "l2")

            if optimizer == "sgd":
                model = lm.SGDRegressor(loss=loss, penalty=regularization, max_iter=epochs)
            else:
                if loss == "squared_loss":
                    if regularization == "l2":
                        model = lm.Ridge(alpha=params.get("alpha", 1.0), max_iter=epochs)
                    elif regularization == "l1":
                        model = lm.Lasso(alpha=params.get("alpha", 1.0), max_iter=epochs)
                    elif regularization == "elasticnet":
                        model = lm.ElasticNet(alpha=params.get("alpha", 1.0), l1_ratio=params.get("l1_ratio", 0.5), max_iter=epochs)
                elif loss == "huber":
                    model = lm.HuberRegressor(alpha=params.get("alpha", 1.0), max_iter=epochs)
                else:
                    raise ValueError(f"Unsupported loss function: {loss}")
        else:
            raise ValueError(f"Unsupported model type for regression: {model_type}")
        
    elif problem_type == 'classify':
        if model_type == 'svm':
            model = sv.SVC(kernel=params.get("kernel", "rbf"),
                          C=params.get("C", 1.0),
                          gamma=params.get("gamma", 'scale'),
                          probability=params.get("probability", False), max_iter=epochs)
        elif model_type == 'tree':
            model = tree.DecisionTreeClassifier(criterion=params.get("criterion", "gini"),
                                                max_depth=params.get("max_depth", None), max_iter=epochs)
        elif model_type == 'forest':
            model = ensemble.RandomForestClassifier(criterion=params.get("criterion", "gini"),
                                                    n_estimators=params.get("n_estimators", 100),
                                                    max_depth=params.get("max_depth", None), max_iter=epochs)
        elif model_type == 'knn':
            model = neighbors.KNeighborsClassifier(n_neighbors=params.get("n_neighbors", 5),
                                                   weights=params.get("weights", 'uniform'),
                                                   metric=params.get("metric", 'minkowski'),
                                                   p=params.get("p", 2), max_iter=epochs)
        elif model_type == 'linear':
            loss = params.get("loss", "log_loss")
            optimizer = params.get("optimizer", "analytical")
            regularization = params.get("regularization", "l2")
            if optimizer == "adam":
                # Imported from torch nn linear models
                return None
            elif optimizer == "sgd":
                model = lm.SGDClassifier(loss=loss, penalty=regularization, max_iter=epochs)
            else:
                solver = 'lbfgs' if size == 'small' else 'saga'
                if loss == "log_loss":
                    if regularization == "l2":
                        model = lm.LogisticRegression(penalty='l2', C=params.get("C", 1.0), solver=solver, max_iter=epochs)
                    elif regularization == "l1":
                        model = lm.LogisticRegression(penalty='l1', C=params.get("C", 1.0), solver=solver, max_iter=epochs)
                    elif regularization == "elasticnet":
                        model = lm.LogisticRegression(penalty='elasticnet', C=params.get("C", 1.0), solver=solver, l1_ratio=params.get("l1_ratio", 0.5), max_iter=epochs)
                else:
                    raise ValueError(f"Unsupported loss function: {loss}")
        else:
            raise ValueError(f"Unsupported model type for classification: {model_type}")
    
    return model


def create_model_simple(config: dict):
    model_type = config.get('model_type')
    epochs = config.get('epochs', 100)
    model = None
    
    if model_type == 'logistic':
        model = lm.LogisticRegression(penalty=config.get('regularization', 'l2'),
                                      solver='lbfgs',
                                      max_iter=epochs)
    elif model_type == 'svm':
        model = sv.SVC(kernel=config.get("kernel", "rbf"),
                          C=config.get("C", 1.0),
                          gamma='auto',
                          max_iter=epochs)
        
    elif model_type == 'tree':
        model = tree.DecisionTreeClassifier(criterion=config.get("criterion", "gini"),
                                                max_depth=config.get("maxDepth", None))
    elif model_type == 'forest':
        model = ensemble.RandomForestClassifier(criterion=config.get("criterion", "gini"),
                                                n_estimators=config.get("nEstimators", 100),
                                                max_depth=config.get("maxDepth", None))
    elif model_type == 'knn':
        model = neighbors.KNeighborsClassifier(n_neighbors=config.get("nNeighbors", 5),
                                                metric=config.get("metric", 'minkowski'),
                                                p=config.get("p", 2))

    return model

def make_train_and_evaluate_model(config: dict):

    df = safe_read_csv(config.get('wfDir'))
    X = df.iloc[:, :-1].values
    y = df.iloc[:, -1].values

    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = create_model_simple(config)
    model.fit(X_train, y_train)

    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    # compute confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    # confusion matrix is defined as a list of lists
    cm = cm.tolist()

    # compute decision boundary
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 50), np.linspace(y_min, y_max, 50))
    grid_points = np.c_[xx.ravel(), yy.ravel()]
    
    # Get predictions for each grid point
    if hasattr(model, 'predict_proba'):
        # For models that support probability predictions
        Z_prob = model.predict_proba(grid_points)
        predicted_classes = np.argmax(Z_prob, axis=1)
    else:
        # For models that only support class predictions
        predicted_classes = model.predict(grid_points)
    
    # Convert coordinates to list of [x, y] points
    decision_boundary = grid_points.tolist()
    # Convert predictions to list of class indices
    predicted_classes = predicted_classes.tolist()

    # base accuracy is the accuracy of the model when it predicts the majority class
    # majority class is the class with the highest number of occurrences in the training data
    majority_class = np.argmax(np.bincount(y_train))
    base_accuracy = accuracy_score(y_test, np.full_like(y_test, majority_class))

    # trained coefficients and intercept are the coefficients and intercept of the model
    # only relevant for linear models
    if config.get('model_type') == 'logistic':
        trained_coefficients = model.coef_.tolist()
        trained_intercept = model.intercept_.tolist()
    else:
        trained_coefficients = None
        trained_intercept = None

    # trained support vectors are the support vectors of the model
    # only relevant for SVMs
    if config.get('model_type') == 'svm':
        trained_support_vectors = model.support_vectors_.tolist()
    else:
        trained_support_vectors = None

    return {
        'decisionBoundary': decision_boundary,
        'predictedClasses': predicted_classes,
        'baseAccuracy': base_accuracy,
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1Score': f1,
        'confusionMatrix': cm,
        'trainedCoefficients': trained_coefficients,
        'trainedIntercept': trained_intercept,
        'trainedSupportVectors': trained_support_vectors
    }

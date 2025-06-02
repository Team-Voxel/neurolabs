import sklearn.svm as sv
import sklearn.tree as tree
import sklearn.ensemble as ensemble
import sklearn.neighbors as neighbors
import sklearn.linear_model as lm
import sklearn.neural_network as nn




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
    model = None

    if problem_type == 'regress':
        if model_type == 'svm':
            model = sv.SVR(kernel=params.get("kernel", "rbf"),
                          C=params.get("C", 1.0),
                          epsilon=params.get("epsilon", 0.1),
                          gamma=params.get("gamma", 'scale'))
        elif model_type == 'tree':
            model = tree.DecisionTreeRegressor(criterion=params.get("criterion", "mse"),
                                               max_depth=params.get("max_depth", None))
        elif model_type == 'forest':
            model = ensemble.RandomForestRegressor(criterion=params.get("criterion", "mse"),
                                                   n_estimators=params.get("n_estimators", 100),
                                                   max_depth=params.get("max_depth", None))
        elif model_type == 'knn':
            model = neighbors.KNeighborsRegressor(n_neighbors=params.get("n_neighbors", 5),
                                                   weights=params.get("weights", 'uniform'),
                                                   metric=params.get("metric", 'minkowski'),
                                                   p=params.get("p", 2))
        elif model_type == 'linear':
            loss = config.get("loss", "squared_loss")
            optimizer = config.get("optimizer", "analytical")
            regularization = config.get("regularization", "l2")
            if optimizer == "adam":
                # Imported from torch nn linear models
                return None
            elif optimizer == "sgd":
                model = lm.SGDRegressor(loss=loss, penalty=regularization)
            else:
                if loss == "squared_loss":
                # Analytical or Linear Algebraic methods
                    if regularization == "l2":
                        model = lm.Ridge(alpha=params.get("alpha", 1.0))
                    elif regularization == "l1":
                        model = lm.Lasso(alpha=params.get("alpha", 1.0))
                    elif regularization == "elasticnet":
                        model = lm.ElasticNet(alpha=params.get("alpha", 1.0), l1_ratio=params.get("l1_ratio", 0.5))
                elif loss == "huber":
                    model = lm.HuberRegressor(alpha=params.get("alpha", 1.0))
                else:
                    raise ValueError(f"Unsupported loss function: {loss}")
        else:
            raise ValueError(f"Unsupported model type for regression: {model_type}")
        
    elif problem_type == 'classify':
        if model_type == 'svm':
            model = sv.SVC(kernel=params.get("kernel", "rbf"),
                          C=params.get("C", 1.0),
                          gamma=params.get("gamma", 'scale'),
                          probability=params.get("probability", False))
        elif model_type == 'tree':
            model = tree.DecisionTreeClassifier(criterion=params.get("criterion", "gini"),
                                                max_depth=params.get("max_depth", None))
        elif model_type == 'forest':
            model = ensemble.RandomForestClassifier(criterion=params.get("criterion", "gini"),
                                                    n_estimators=params.get("n_estimators", 100),
                                                    max_depth=params.get("max_depth", None))
        elif model_type == 'knn':
            model = neighbors.KNeighborsClassifier(n_neighbors=params.get("n_neighbors", 5),
                                                   weights=params.get("weights", 'uniform'),
                                                   metric=params.get("metric", 'minkowski'),
                                                   p=params.get("p", 2))
        elif model_type == 'linear':
            loss = config.get("loss", "log_loss")
            optimizer = config.get("optimizer", "analytical")
            regularization = config.get("regularization", "l2")
            if optimizer == "adam":
                # Imported from torch nn linear models
                return None
            elif optimizer == "sgd":
                model = lm.SGDClassifier(loss=loss, penalty=regularization)
            else:
                solver = 'lbfgs' if size == 'small' else 'saga'
                if loss == "log_loss":
                    if regularization == "l2":
                        model = lm.LogisticRegression(penalty='l2', C=params.get("C", 1.0), solver=solver)
                    elif regularization == "l1":
                        model = lm.LogisticRegression(penalty='l1', C=params.get("C", 1.0), solver=solver)
                    elif regularization == "elasticnet":
                        model = lm.LogisticRegression(penalty='elasticnet', C=params.get("C", 1.0), solver=solver, l1_ratio=params.get("l1_ratio", 0.5))
                else:
                    raise ValueError(f"Unsupported loss function: {loss}")
        else:
            raise ValueError(f"Unsupported model type for classification: {model_type}")
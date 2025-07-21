from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet, Lars
from sklearn.base import BaseEstimator, RegressorMixin
import numpy as np

class ARLinearRegressor(BaseEstimator, RegressorMixin):
    """
    A flexible linear regressor that can switch between different
    regularization methods based on parameters.
    """

    def __init__(self, regularization_method='none', alpha=1.0, l1_ratio=0.5, **kwargs):
        """
        Initializes the ARLinearRegressor.

        Parameters
        ----------
        regularization_method : str, default='none'
            The type of regularization to use.
            Options: 'none', 'ridge', 'lasso', 'elasticnet', 'lars'.
        alpha : float, default=1.0
            Constant that multiplies the penalty terms.
            Ignored for 'none' and 'lars'.
            For Ridge and Lasso, higher alpha means stronger regularization.
            For ElasticNet, it's the overall regularization strength.
        l1_ratio : float, default=0.5
            The ElasticNet mixing parameter, with 0 <= l1_ratio <= 1.
            Only applicable for 'elasticnet'.
            For l1_ratio = 0 the penalty is an L2 penalty (Ridge).
            For l1_ratio = 1 it is an L1 penalty (Lasso).
            For 0 < l1_ratio < 1, the penalty is a combination.
        **kwargs : dict
            Additional keyword arguments to pass to the underlying scikit-learn regressor.
            e.g., max_iter, tol, solver for Ridge/Lasso/ElasticNet.
        """
        self.regularization_method = regularization_method
        self.alpha = alpha
        self.l1_ratio = l1_ratio
        self.kwargs = kwargs
        self.model = None # This will hold the actual scikit-learn model
        self.fit_intercept = True
        # Input validation for l1_ratio
        if not (0 <= self.l1_ratio <= 1):
            raise ValueError("l1_ratio must be between 0 and 1.")

        self._initialize_model()

    def _initialize_model(self):
        """
        Initializes the appropriate scikit-learn model based on
        regularization_method and other parameters.
        """
        if self.regularization_method == 'none':
            self.model = LinearRegression()
        elif self.regularization_method == 'ridge':
            self.model = Ridge(alpha=self.alpha, max_iter=self.kwargs.get('max_iter', None))
        elif self.regularization_method == 'lasso':
            self.model = Lasso(alpha=self.alpha, max_iter=self.kwargs.get('max_iter', None))
        elif self.regularization_method == 'elasticnet':
            self.model = ElasticNet(alpha=self.alpha,
                                    l1_ratio=self.l1_ratio,
                                    max_iter=self.kwargs.get('max_iter', None))
        elif self.regularization_method == 'lars':
            self.model = Lars()
        else:
            raise ValueError(f"Unknown regularization_method: {self.regularization_method}")

    def fit(self, X, y, **fit_params):
        """
        Fits the underlying linear model.
        """
        # Re-initialize model in case parameters were changed after instantiation
        self._initialize_model()
        self.model.fit(X, y, **fit_params)
        self.coef_ = self.model.coef_
        self.intercept_ = self.model.intercept_
        return self

    def predict(self, X):
        """
        Predicts using the fitted linear model.
        """
        if self.model is None:
            raise RuntimeError("Model has not been fitted yet. Call .fit() first.")
        return self.model.predict(X)

    def score(self, X, y, sample_weight=None):
        """
        Returns the coefficient of determination R^2 of the prediction.
        """
        if self.model is None:
            raise RuntimeError("Model has not been fitted yet. Call .fit() first.")
        return self.model.score(X, y, sample_weight)
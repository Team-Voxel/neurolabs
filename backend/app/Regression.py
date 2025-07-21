import sympy as sp
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error
from scipy.optimize import curve_fit
import sklearn.linear_model as lm

def is_linear(expression, *vars):
    """
    Checks if a SymPy expression is linear with respect to the given variables.

    Args:
        expression: The SymPy expression to check.
        *vars: The variables to check linearity against.

    Returns:
        True if the expression is linear, False otherwise.
    """
    for var in vars:
        if sp.degree(expression, var) > 1:
            return False
    return True


def fit_linear(X: np.ndarray, y: np.ndarray, formula: str, param_names: list[str]):
    # 1) Create symbols X0, X1, X2, ... depending on number of columns
    n_features = X.shape[0]
    X_syms = sp.symbols(' '.join(f'X{i}' for i in range(n_features)))
    
    # 2) Map "X[i]" in your formula to the symbol Xi
    mapping = {f'X[{i}]': str(X_syms[i]) for i in range(n_features)}
    for old, new in mapping.items():
        formula = formula.replace(old, new)
    
    # 3) Parse the expression
    params = sp.symbols(' '.join(param_names))
    expr = sp.sympify(formula, locals={**{str(s): s for s in X_syms}, **{str(p): p for p in params}})
    
    # 4) Build feature functions: ∂expr/∂param_i
    feature_exprs = [sp.diff(expr, p) for p in params]
    #    plus the constant term (expr with all params=0)
    const_expr = expr.subs({p: 0 for p in params})
    feature_exprs.append(const_expr)
    
    # 5) Lambdify into NumPy-callable functions of X0, X1, ...
    f_fns = [sp.lambdify(X_syms, fe, 'numpy') for fe in feature_exprs]
    
    # 6) Build the design matrix Φ: shape (n_samples, n_params+1)
    #    each fn returns an array of length n_samples
    Phi = np.column_stack([fn(*X) for fn in f_fns])
    
    # 7) Linear solve (no intercept, since you included the constant term)
    lr = lm.LinearRegression(fit_intercept=False)
    lr.fit(Phi, y)
    
    # return estimated parameters (last coef is your constant “b”)
    return dict(zip(param_names + ['const'], lr.coef_.tolist()))


def fit_equation(X : np.ndarray, y : np.ndarray, equation:str, param_names=[]):
    """
    Fit a given equation to the data using curve fitting.
    
    Parameters:
    X : array-like
        The independent variable data.
    y : array-like
        The dependent variable data.
    equation : str
        The equation to fit, in terms of 'x'.
    
    Returns:
    popt : array
        Optimal values for the parameters of the fitted equation.
    """
    params = sp.symbols(param_names)
    n = len(X)
    m = len(X[0])
    symbols = sp.symbols(f'x1:{m+1}')  # This creates x1, x2, ..., xm

    expression = sp.sympify(equation, locals={**{str(s): s for s in symbols}, **{str(p): p for p in params}})
    f = sp.lambdify(symbols, expression, 'numpy')

    print("Expression:", expression)
    print("f(X):", f(*X[0]))
    print("f(X):", f(*X[1]))
    """ 
    def wrapped(X_flat, *pvals):
        Xmat = X_flat.reshape(X.shape)
        return f(Xmat, *pvals)
    p0 = np.random.rand(len(param_names))  # initial guess for parameters
    popt, _ = curve_fit(f, X, y, p0=p0)
    return dict(zip(param_names, popt)) """

    


eq = 'a*x1 + b*x2 + c'
X = np.array([[1, 2], [3, 4], [5, 6]])
y = np.array([2, 3, 4])
param_names = ['a', 'b', 'c']
popt = fit_equation(X, y, eq, param_names)
print("Fitted parameters:", popt)
print("Actual parameters:", [1, 1, 0])  # Expected: a=1, b=1, c=0




""" data = np.array([
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12]
])

n, m = data.shape
print(data.shape)
# 2. Create symbolic variables x1, x2, ..., xm
symbols = sp.symbols(f'x1:{m+1}')  # This creates x1, x2, ..., xm
print(symbols)
# 3. Create symbolic expressions for each row
# For example, dot product of row with symbols
expression = symbols[0]+symbols[1]+symbols[2]+symbols[3]
print(expression)
expression = sp.lambdify(symbols, expression, 'numpy')
print(expression(*data[0]))
print(expression(*data[1]))
print(expression(*data[2])) """


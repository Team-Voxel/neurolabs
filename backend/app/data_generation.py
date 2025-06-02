'''

'''

import scipy.stats as stats
import pandas as pd
from typing import Dict, List, Tuple
import sklearn.datasets as skd
import numpy as np
from data_analysis import generate_df_summary


def convert_manifold_to_classes(config: Dict, tm):
    """
    We can create classes by dividing the 'tm' parameter (position along the curve) into N_CLASSES segments.
    We'll use percentiles to divide the 'tm' values into distinct classes.
    """
    N_CLASSES = config.get('n_clusters', 2)
    percentiles = np.linspace(0, 100, N_CLASSES + 1)
    class_thresholds = np.percentile(tm, percentiles)

    yc = np.zeros(config['n_samples'], dtype=int)
    for i in range(N_CLASSES):
        lower_bound = class_thresholds[i]
        upper_bound = class_thresholds[i+1]
        # For the last class, make sure to include the maximum value
        if i == N_CLASSES - 1:
            yc[(tm >= lower_bound) & (tm <= upper_bound)] = i
        else:
            yc[(tm >= lower_bound) & (tm < upper_bound)] = i

    return yc


def make_gp_sample(X, kernel_fn, noise_std=1e-2):
    # Covariance matrix
    n = X.shape[0]
    K = kernel_fn(X, X)
    # Add noise variance on diagonal
    K += (noise_std**2) * np.eye(n)
    # Sample y ~ N(0, K)
    y = np.random.multivariate_normal(mean=np.zeros(n), cov=K)
    return y


def make_sinusoidal(n_samples = 100, n_features = 1, m_waves = 5, noise_std = 0.1, random_seed = 42, arg_sort = True) -> Tuple[np.ndarray, np.ndarray]:
    A = np.random.normal(0, 5, size=(m_waves, n_features)) # Amplitude matrix
    b = np.random.uniform(0, 2*np.pi, size=m_waves) # Phase shift vector
    w = np.abs(np.random.normal(0, 1, size=m_waves)) # Frequency weights
    X = np.random.uniform(-1, 1, size=(n_samples, n_features)) # Input data

    # f(x) = sum_i w_i * sin(A_i · x + b_i)
    y = np.sum(w[None, :] * np.sin(X.dot(A.T) + b[None, :]), axis=1)
    y += np.random.normal(0, noise_std, size=n_samples)

    if arg_sort:
        X = X[np.argsort(X[:, 0])]

    return X, y


def rbf_kernel(X1, X2, length_scale=1.0):
    diffs = X1[:, None, :] - X2[None, :, :]
    sq_dists = np.sum(diffs**2, axis=2)
    return np.exp(-sq_dists / (2 * length_scale**2))



def make_gp_data(n_samples = 100, n_features = 1, noise_std = 0.01, random_seed = 12) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic data using Gaussian Process regression.
    """
    np.random.seed(random_seed)
    X = np.random.uniform(-3, 3, size=(n_samples, n_features))
    y = make_gp_sample(X, lambda A,B: rbf_kernel(A,B,0.5), noise_std=noise_std)
    return X, y


def generate_classification(config: Dict) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate a synthetic classification dataset using sklearn's make_classification.
    """
    X : np.ndarray = None 
    y : np.ndarray = None

    if config.get('is_clusters', False) == True:
        cluster_type = config.get('cluster_type', 'blobs')

        # Generate clusters of points
        if cluster_type == 'blobs':
            # Use make_blobs for cluster generation
            X, y = skd.make_blobs(
                n_samples=config['n_samples'],
                centers=config['n_clusters'],
                n_features=config['n_features'],
                cluster_std=config.get('cluster_dispersion', 1.0),
                random_state=config.get('random_state', 42)
            )
            return X, y
        elif cluster_type == 'moons':
            # Use make_moons for a two-dimensional dataset with two interleaving half circles
            X, y = skd.make_moons(
                n_samples=config['n_samples'],
                noise=config.get('noise', 0.1),
                random_state=config.get('random_state', 42)
            )
            return X, y
        elif cluster_type == 'circles':
            # Use make_circles for a two-dimensional dataset with concentric circles
            X, y = skd.make_circles(
                n_samples=config['n_samples'],
                noise=config.get('noise', 0.1),
                factor=config.get('factor', 0.5),
                random_state=config.get('random_state', 42)
            )
            return X, y
        elif cluster_type == 's-curve':
            # Use make_s_curve for a three-dimensional S-shaped curve
            X, tm = skd.make_s_curve(
                n_samples=config['n_samples'],
                noise=config.get('noise', 0.1),
                random_state=config.get('random_state', 42)
            )
            # Convert the manifold to classes
            y = convert_manifold_to_classes(config, tm)
            return X, y
        elif cluster_type == 'swiss_roll':
            # Use make_swiss_roll for a three-dimensional Swiss roll
            X, tm = skd.make_swiss_roll(
                n_samples=config['n_samples'],
                noise=config.get('noise', 0.1),
                random_state=config.get('random_state', 42)
            )
            # Convert the manifold to classes
            y = convert_manifold_to_classes(config, tm)
            return X, y            
    else:
        # Generate a standard classification dataset
        X, y = skd.make_classification(
            n_samples=config['n_samples'],
            n_features=config['n_features'],
            n_informative=config.get('n_informative', 2),
            n_redundant=config.get('n_redundant', 0),
            n_clusters_per_class=config.get('n_clusters_per_class', 1),
            random_state=config.get('random_state', 42)
        )
        return X, y


def generate_regression(config: Dict) -> Tuple[np.ndarray, np.ndarray]:
    '''
    Generate a synthetic regression dataset based on the specified configuration.
    Parameters:
        config (Dict): A dictionary containing the configuration for dataset generation. 
            Keys:
                - 'reg_gen_strat' (str): The strategy for generating the regression dataset. 
                  Options include:
                    - 'lin': Linear regression.
                    - 'fr1': Friedman's regression function 1.
                    - 'fr2': Friedman's regression function 2.
                    - 'fr3': Friedman's regression function 3.
                    - 'gp': Gaussian process regression.
                    - 'sin': Sinusoidal regression.
                  Default is 'lin'.
                - 'n_samples' (int): The number of samples to generate.
                - 'n_features' (int): The number of features for the dataset.
                - 'n_informative' (int, optional): The number of informative features (used for 'lin' strategy). Default is 2.
                - 'noise' (float, optional): The standard deviation of the noise to add to the output. Default is 0.1.
                - 'random_state' (int, optional): The seed for random number generation. Default is 42.
                - 'm_waves' (int, optional): The number of sinusoidal waves (used for 'sin' strategy). Default is 5.
    Returns:
        Tuple[np.ndarray, np.ndarray]: A tuple containing:
            - X (np.ndarray): The generated feature matrix.
            - y (np.ndarray): The target values.
    Raises:
        KeyError: If required keys are missing in the configuration dictionary.
        ValueError: If an unsupported generation strategy is specified.
    Notes:
        - Strategies 'rbf' (Gaussian radial basis function) and 'rff' (random Fourier features) are not implemented.
    '''

    """
    lin: linear regression
    fr1,fr2,fr3: friedman's regression functions
    rbf: gaussian radial basis function # NOT IMPLEMENTED
    rff: random fourier features # NOT IMPLEMENTED
    sin: sinusoidal regression
    gp: gaussian process regression
    """
    strategy = config.get('reg_gen_strat', 'lin')

    if strategy == 'lin':
        X, y = skd.make_regression(
            n_samples=config['n_samples'],
            n_features=config['n_features'],
            n_informative=config.get('n_informative', 2),
            noise=config.get('noise', 0.1),
            random_state=config.get('random_state', 42)
        )
        return X, y
    elif strategy == 'fr1':
        X, y = skd.make_friedman1(
            n_samples=config['n_samples'],
            noise=config.get('noise', 0.1),
            random_state=config.get('random_state', 42)
        )
        return X, y
    elif strategy == 'fr2':
        X, y = skd.make_friedman2(
            n_samples=config['n_samples'],
            noise=config.get('noise', 0.1),
            random_state=config.get('random_state', 42)
        )
        return X, y
    elif strategy == 'fr3':
        X, y = skd.make_friedman3(
            n_samples=config['n_samples'],
            noise=config.get('noise', 0.1),
            random_state=config.get('random_state', 42)
        )
        return X, y
    elif strategy == 'gp':
        X, y = make_gp_data(
            n_samples=config['n_samples'],
            n_features=config['n_features'],
            noise_std=config.get('noise', 0.01),
            random_seed=config.get('random_state', 42)
        )
        return X, y
    elif strategy == 'sin':
        X, y = make_sinusoidal(
            n_samples=config['n_samples'],
            n_features=config['n_features'],
            m_waves=config.get('m_waves', 5),
            noise_std=config.get('noise', 0.1),
            random_seed=config.get('random_state', 42)
        )
        return X, y
    

def generate_data(config: Dict) -> Tuple[np.ndarray, np.ndarray]:
    if config.get('problem_type', 'classify') == 'classify':
        return generate_classification(config)
    else:
        return generate_regression(config)
    

def generate_data_into_dataframe(config: Dict) -> pd.DataFrame:
    """
    Generate synthetic data and return it as a pandas DataFrame.
    """
    X, y = generate_data(config)
    
    # Create feature names
    feature_names = [f"X_{i+1}" for i in range(X.shape[1])]
    
    # Create DataFrame
    df = pd.DataFrame(X, columns=feature_names)
    
    # Add target column
    if config.get('problem_type', 'classify') == 'classify':
        df['target'] = y.astype(int)  # Ensure target is categorical
    else:
        df['target'] = y  # Regression target remains numeric
    
    return df


def generate_and_save_data_return_stats(config: Dict) -> Dict:
    """
    Generate synthetic data, save it to a CSV file, and return basic statistics.
    """
    df = generate_data_into_dataframe(config)

    # Save DataFrame to CSV
    file_path = config.get('wfDir', 'generated_data.csv')
    df.to_csv(file_path, index=False)
    
    # Compute basic statistics
    stats = generate_df_summary(df, 'target', problem_type=config.get('problem_type', 'classify'))
    
    return stats
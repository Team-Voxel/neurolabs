'''

'''

import scipy.stats as stats
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union
import sklearn.datasets as skd
import numpy as np
from data_analysis import generate_df_summary
from enum import Enum
import random
from sklearn.preprocessing import StandardScaler
from dataclasses import dataclass


def convert_manifold_to_classes(n_classes, n_samples, tm):
    """
    We can create classes by dividing the 'tm' parameter (position along the curve) into N_CLASSES segments.
    We'll use percentiles to divide the 'tm' values into distinct classes.
    """
    N_CLASSES = n_classes
    percentiles = np.linspace(0, 100, N_CLASSES + 1)
    class_thresholds = np.percentile(tm, percentiles)

    yc = np.zeros(n_samples, dtype=int)
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


class ClusterType(Enum):
    BLOBS = 'blobs'
    MOONS = 'moons'
    CIRCLES = 'circles'
    S_CURVE = 's-curve'
    SWISS_ROLL = 'swiss_roll'

@dataclass
class DatasetConfig:
    n_samples: int
    n_features: int
    is_clusters: bool = False
    cluster_type: Optional[str] = None
    n_clusters: Optional[int] = None
    cluster_dispersion: float = 1.0
    noise: float = 0.1
    random_state: Optional[int] = 42
    n_informative: int = 2
    n_redundant: int = 0
    n_classes: int = 2
    n_clusters_per_class: int = 1
    class_sep: float = 1.0
    class_balance: Optional[List[float]] = None
    hypercube: bool = True
    scale_features: bool = False

def validate_config(config: Union[Dict, DatasetConfig]) -> DatasetConfig:
    """Validate and convert configuration to DatasetConfig."""
    if isinstance(config, dict):
        try:
            config = DatasetConfig(**config)
        except TypeError as e:
            raise ValueError(f"Invalid configuration parameters: {str(e)}")

    # Validate sample size
    if config.n_samples < 1:
        raise ValueError("n_samples must be positive")

    # Validate features
    if config.n_features < 1:
        raise ValueError("n_features must be positive")

    # Validate cluster-specific parameters
    if config.is_clusters:
        if not config.cluster_type:
            raise ValueError("cluster_type must be specified when is_clusters is True")
        try:
            cluster_type = ClusterType(config.cluster_type)
        except ValueError:
            raise ValueError(f"Invalid cluster_type. Must be one of {[t.value for t in ClusterType]}")

        if cluster_type in [ClusterType.MOONS, ClusterType.CIRCLES]:
            if config.n_features != 2:
                raise ValueError(f"{cluster_type.value} requires n_features=2")
        
        if cluster_type in [ClusterType.S_CURVE, ClusterType.SWISS_ROLL]:
            if config.n_features != 3:
                raise ValueError(f"{cluster_type.value} requires n_features=3")

    # Validate classification parameters
    else:
        if config.n_informative > config.n_features:
            raise ValueError("n_informative cannot be greater than n_features")
        if config.n_redundant > config.n_features - config.n_informative:
            raise ValueError("n_redundant cannot be greater than n_features - n_informative")
        if config.class_balance is not None:
            if not isinstance(config.class_balance, list):
                raise ValueError("class_balance must be a list of weights")
            if len(config.class_balance) != config.n_classes:
                raise ValueError("class_balance length must match n_classes")
            if not all(0 <= w <= 1 for w in config.class_balance):
                raise ValueError("class_balance weights must be between 0 and 1")
            if abs(sum(config.class_balance) - 1.0) > 1e-10:
                raise ValueError("class_balance weights must sum to 1")

    return config

def generate_classification(config: Union[Dict, DatasetConfig]) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate a synthetic classification dataset using sklearn's dataset generators.

    Args:
        config: Configuration dictionary or DatasetConfig object containing:
            Required:
                n_samples (int): Number of samples to generate
                n_features (int): Number of features for each sample
            Optional:
                is_clusters (bool): Whether to generate clustered data
                cluster_type (str): Type of clusters ('blobs', 'moons', 'circles', 's-curve', 'swiss_roll')
                n_clusters (int): Number of clusters for 'blobs'
                cluster_dispersion (float): Standard deviation of clusters
                noise (float): Amount of noise to add
                random_state (int): Random seed for reproducibility
                n_informative (int): Number of informative features
                n_redundant (int): Number of redundant features
                n_classes (int): Number of classes
                n_clusters_per_class (int): Number of clusters per class
                class_sep (float): Factor multiplying the hypercube size
                class_balance (List[float]): List of class weights
                hypercube (bool): If True, generate points in a hypercube
                scale_features (bool): If True, scale features to zero mean and unit variance

    Returns:
        Tuple[np.ndarray, np.ndarray]: Features array (X) and labels array (y)

    Raises:
        ValueError: If configuration parameters are invalid
    """
    try:
        # Validate configuration
        config = validate_config(config)
        
        X: np.ndarray = None
        y: np.ndarray = None

        if config.is_clusters:
            cluster_type = ClusterType(config.cluster_type)

            if cluster_type == ClusterType.BLOBS:
                X, y = skd.make_blobs(
                    n_samples=config.n_samples,
                    centers=config.n_clusters,
                    n_features=config.n_features,
                    cluster_std=config.cluster_dispersion,
                    random_state=config.random_state
                )
            elif cluster_type == ClusterType.MOONS:
                X, y = skd.make_moons(
                    n_samples=config.n_samples,
                    noise=config.noise,
                    random_state=config.random_state
                )
            elif cluster_type == ClusterType.CIRCLES:
                X, y = skd.make_circles(
                    n_samples=config.n_samples,
                    noise=config.noise,
                    factor=0.5,
                    random_state=config.random_state
                )
            elif cluster_type in [ClusterType.S_CURVE, ClusterType.SWISS_ROLL]:
                generator = skd.make_s_curve if cluster_type == ClusterType.S_CURVE else skd.make_swiss_roll
                X, tm = generator(
                    n_samples=config.n_samples,
                    noise=config.noise,
                    random_state=config.random_state
                )
                # Convert the manifold to classes
                y = convert_manifold_to_classes(config.n_classes, config.n_samples, tm)
        else:
            X, y = skd.make_classification(
                n_samples=config.n_samples,
                n_features=config.n_features,
                n_informative=config.n_informative,
                n_redundant=config.n_redundant,
                n_classes=config.n_classes,
                n_clusters_per_class=config.n_clusters_per_class,
                random_state=config.random_state,
                class_sep=config.class_sep,
                weights=config.class_balance,
                hypercube=config.hypercube,
                flip_y=config.noise * 0.1,
            )

        # Scale features if requested
        if config.scale_features:
            X = StandardScaler().fit_transform(X)

        return X, y

    except Exception as e:
        raise ValueError(f"Error generating classification dataset: {str(e)}")


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


def generate_random_2D(n_classes, noise, wfDir):
    """
    Generate a random 2D dataset with n_classes for classification.
    """
    cols = ['x1', 'x2']
    import random
    
    if n_classes > 2:
        clusters = ['blobs', 's-curve', 'swiss_roll']
    else:
        clusters = ['blobs', 'moons', 'circles', 's-curve', 'swiss_roll']

    cluster_type = random.choice(clusters)
    is_clusters = random.randint(0, 1) == 1 or n_classes >= 5

    # generate an array of n_classes-1 random numbers that sum to 1
    class_balance = None

    if n_classes == 4 or n_classes == 3:
        clusters_per_class = 1
    elif n_classes == 2:
        clusters_per_class = 2
    else:
        clusters_per_class = 4
    config = {
        'n_samples': 1000,
        'n_features': 2,
        'n_clusters': n_classes,
        'cluster_type': cluster_type,
        'is_clusters': is_clusters,
        'n_informative': 2,
        'n_redundant': 0,
        'n_clusters_per_class': clusters_per_class,
        'cluster_dispersion': 1.0,
        'factor': random.uniform(0.0, 1.0),
        'noise': noise,
        'cluster_dispersion': random.uniform(0.5, 3.5)*noise,
        'class_balance': class_balance,
        'class_sep': random.uniform(0.5, 3.5),
        'hypercube': random.randint(0, 1) == 1,
        'random_state': random.randint(0, 1000000)
    }

    X, y = generate_classification(config)
    
    if X.shape[1] != 2:
        #randomly select two columns
        X = X[:, np.random.randint(0, X.shape[1], 2)]
    
    df = pd.DataFrame(X, columns=cols)
    df['y'] = y.astype(int)

    file_path = wfDir
    df.to_csv(file_path, index=False)
    
    return {
        'X': X.tolist(),
        'y': y.tolist()
    }
    

class DifficultyLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

def get_difficulty_config(difficulty: DifficultyLevel) -> dict:
    """
    Get dataset generation configuration based on difficulty level.
    Handles sklearn dataset generation constraints:
    - n_classes * n_clusters_per_class <= 2**n_informative
    - n_informative <= n_features
    - swiss_roll and s-curve require n_features >= 3
    - circles requires n_features == 2
    """
    def adjust_for_constraints(config: dict) -> dict:
        """Adjust configuration to meet sklearn constraints."""
        # Ensure n_informative doesn't exceed n_features
        config['n_informative'] = min(config['n_informative'], config['n_features'])
        
        # Calculate max possible classes based on n_informative
        max_clusters = 2 ** config['n_informative']
        total_clusters = config['n_classes'] * config['n_clusters_per_class']
        
        # Adjust if constraint is violated
        if total_clusters > max_clusters:
            # Try reducing clusters per class first
            new_clusters = max(1, max_clusters // config['n_classes'])
            if new_clusters < config['n_clusters_per_class']:
                config['n_clusters_per_class'] = new_clusters
            
            # If still violated, reduce number of classes
            total_clusters = config['n_classes'] * config['n_clusters_per_class']
            if total_clusters > max_clusters:
                config['n_classes'] = max(2, max_clusters // config['n_clusters_per_class'])

        # Handle special dataset type constraints
        if config['cluster_type'] in ['swiss_roll', 's-curve']:
            config['n_features'] = max(3, config['n_features'])
        elif config['cluster_type'] == 'circles':
            config['n_features'] = 2
            
        # Final check for n_informative after n_features might have changed
        config['n_informative'] = min(config['n_informative'], config['n_features'])
            
        return config

    base_config = {
        'n_samples': 1000,
        'n_features': 2,
        'n_informative': 2,
        'n_redundant': 0,
        'random_state': random.randint(0, 1000000)
    }
    
    if difficulty == DifficultyLevel.LOW:
        config = {
            **base_config,
            'n_classes': 2,
            'n_clusters_per_class': 1,
            'class_sep': 3.0,
            'cluster_dispersion': 0.5,
            'noise': 0.05,
            'cluster_type': 'blobs',
            'is_clusters': True,
        }
        return adjust_for_constraints(config)
        
    elif difficulty == DifficultyLevel.MEDIUM:
        config = {
            **base_config,
            'n_features': 2,
            'n_informative': 2,
            'n_classes': random.choice([2, 3]),
            'n_clusters_per_class': 2,
            'class_sep': 2.0,
            'cluster_dispersion': 1.0,
            'noise': 0.1,
            'cluster_type': random.choice(['blobs', 'moons', 'circles']),
            'is_clusters': random.choice([True, False]),
        }
        return adjust_for_constraints(config)
        
    elif difficulty == DifficultyLevel.HIGH:
        config = {
            **base_config,
            'n_features': 3,
            'n_informative': 3,
            'n_classes': random.choice([3, 4]),
            'n_clusters_per_class': random.choice([2, 3]),
            'class_sep': 1.0,
            'cluster_dispersion': 2.0,
            'noise': 0.2,
            'cluster_type': random.choice(['s-curve', 'swiss_roll']),
            'is_clusters': random.choice([True, False]),
        }
        return adjust_for_constraints(config)
        
    else:  # VERY_HIGH
        config = {
            **base_config,
            'n_features': 3,
            'n_informative': 3,
            'n_classes': random.choice([4, 5]),
            'n_clusters_per_class': random.choice([3, 4]),
            'class_sep': 0.5,
            'cluster_dispersion': 3.0,
            'noise': 0.3,
            'cluster_type': random.choice(['s-curve', 'swiss_roll']),
            'is_clusters': True,
        }
        return adjust_for_constraints(config)

def generate_dataset(difficulty: str = "medium", file_path: str = "generated_data.csv") -> tuple:
    """
    Generate a random 2D dataset with specified difficulty level for classification.
    
    Parameters:
    -----------
    difficulty : str
        One of "low", "medium", "high", or "very_high"
        
    Returns:
    --------
    tuple : (X, y)
        X : numpy array of shape (n_samples, 2)
        y : numpy array of shape (n_samples,)
    """
    try:
        difficulty_level = DifficultyLevel(difficulty.lower())
    except ValueError:
        raise ValueError("Difficulty must be one of: low, medium, high, very_high")
    
    config = get_difficulty_config(difficulty_level)
    
    X, y = generate_classification(config)
    
    # Ensure we always have 2D data
    if X.shape[1] != 2:
        X = X[:, :2]
    
    # Standardize the features
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Add some randomness to feature rotation
    if random.random() < 0.5:
        angle = random.uniform(0, 2 * np.pi)
        rotation_matrix = np.array([
            [np.cos(angle), -np.sin(angle)],
            [np.sin(angle), np.cos(angle)]
        ])
        X = X @ rotation_matrix

    # Write the dataset to a csv file
    df = pd.DataFrame(X, columns=['x1', 'x2'])
    df['y'] = y.astype(int)
    df.to_csv(file_path, index=False)
    
    return {
        'X': X.tolist(),
        'y': y.tolist()
    }
    

def generate_simple_dataset(n_classes: int = 2, noise: float = 0.1) -> dict:
    """
    Generate a simple dataset for classification.
    
    Parameters:
    -----------
    n_classes : int
        Number of classes (deprecated, use difficulty parameter instead)
    noise : float
        Noise level (deprecated, use difficulty parameter instead)
        
    Returns:
    --------
    dict
        Dictionary containing the dataset information
    """
    # Map the old parameters to difficulty levels
    if n_classes <= 2 and noise <= 0.1:
        difficulty = "low"
    elif n_classes <= 3 and noise <= 0.2:
        difficulty = "medium"
    elif n_classes <= 4 and noise <= 0.3:
        difficulty = "high"
    else:
        difficulty = "very_high"
    
    X, y = generate_dataset(difficulty)
    
    return {
        'X': X.tolist(),
        'y': y.tolist()
    }
        

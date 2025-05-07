import time

import sklearn.datasets as skd
from sklearn.decomposition import PCA

def generate_classification(config):
    """
    Generate a classification dataset using sklearn.datasets.make_classification.

    Parameters:
    - config: A dictionary containing the configuration for the dataset generation.

    Returns:
    - X: The feature matrix.
    - y: The target vector.
    """

    start_time = time.time()

    # Generate a random classification problem
    X, y = skd.make_classification(n_samples=config['n_samples'],
                                    n_features=config['n_features'],
                                    random_state=config['random_state'], n_redundant=0)

    print(f"Dataset generated in {time.time() - start_time} seconds")

    return X, y
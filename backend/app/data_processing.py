import sklearn.preprocessing as skp
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

import pandas as pd
import numpy as np
import umap
from typing import Dict, List, Tuple


def unsupervised_modelling(config : Dict):
    """
    Perform unsupervised modelling on the given configuration.
    """
    
    df = pd.read_csv(config['data_path'])
    if df.empty:
        raise ValueError("The DataFrame is empty. Please check the data path and content.")

    # Re-Sample the dataframe to reduce size if necessary
    if config['problem_type'] == 'regression':
        df = df.sample(n=config['n_samples'], random_state=config['random_state'])
    else:
        df, _ = train_test_split(df, stratify=df[config['target']],train_size=config['n_samples'], random_state=config['random_state'])
    
    # Drop target column if it exists
    df : pd.DataFrame = df.drop(columns=[config.get('target')], errors='ignore') 

    '''
    Method used to compute the unsupervised model.
    Supported methods: 'umap', 'pca', 'kmeans'
    '''
    method = config['method']
    
    if method == 'umap':
        # Ensure 'n_components' is set, default to 2 if not provided
        n_components = config.get('n_components', 2)
        reducer = umap.UMAP(n_components=n_components, random_state=config['random_state'])
        embedding = reducer.fit_transform(df)
        return embedding
    elif method == 'pca':
        from sklearn.decomposition import PCA
        n_components = config.get('n_components', 2)
        pca = PCA(n_components=n_components, random_state=config['random_state'])
        embedding = pca.fit_transform(df)
        return embedding
    elif method == 'kmeans':
        from sklearn.cluster import KMeans
        n_clusters = config.get('n_clusters', 3)
        kmeans = KMeans(n_clusters=n_clusters, random_state=config['random_state'])
        kmeans.fit(df)
        return kmeans.transform(df), kmeans.labels_
    else:
        raise ValueError(f"Unsupported method: {method}. Supported methods are 'umap', 'pca', 'kmeans'.")
    

def compute_relationships(config : Dict):
    """
    Compute relationships between features in the dataset.
    """
    df = pd.read_csv(config['data_path'])

    if df.empty:
        raise ValueError("The DataFrame is empty. Please check the data path and content.")

    # Ensure the DataFrame has numeric columns for correlation
    corr_pearson = df.corr(method='pearson')
    corr_spearman = df.corr(method='spearman')

    # Normalize the correlation matrix
    corr_pearson = skp.normalize(corr_pearson, axis=0)
    corr_spearman = skp.normalize(corr_spearman, axis=0)

    high_corr_features = []
    # Check if any features are highly correlated (corr >= 0.7) to 'target' column
    target = config.get('target')
    if target and target in df.columns:
        high_corr_features = corr_spearman[target][corr_spearman[target] >= 0.7].index.tolist()
    
    # Compute interactions between features (i.e. High correlation between features)
    interactions = []
    for i in range(len(corr_spearman.columns)):
        for j in range(i + 1, len(corr_spearman.columns)):
            if abs(corr_spearman.iloc[i, j]) >= 0.7:
                interactions.append((corr_spearman.columns[i], corr_spearman.columns[j], corr_spearman.iloc[i, j]))

    # Compute MDI for feature importance
    if config['problem_type'] == 'regression':
        model = RandomForestRegressor(random_state=config['random_state'])
    else:
        model = RandomForestClassifier(random_state=config['random_state'])

    model.fit(df.drop(columns=[target], errors='ignore'), df[target])
    feature_importance = model.feature_importances_
    importance_df = pd.DataFrame({
        'feature': df.drop(columns=[target], errors='ignore').columns,
        'importance': feature_importance
    }).sort_values(by='importance', ascending=False).to_dict(orient='records')

    return {
        'correlation_pearson': corr_pearson.to_dict(),
        'correlation_spearman': corr_spearman.to_dict(),
        'high_correlation_features': high_corr_features,
        'interactions': interactions,
        'feature_importance': importance_df
    }


def compute_distributions(config : Dict):
    """
    Compute box plots for numerical (continuous) features and
    compute stacked bar charts for categorical (discrete numeric) features.
    """
    df = pd.read_csv(config['data_path'])

    if df.empty:
        raise ValueError("The DataFrame is empty. Please check the data path and content.")

    distributions = {}
    
    for column in df.columns:
        if pd.api.types.is_numeric_dtype(df[column]) and df[column].nunique() >= 20:
            distributions[column] = {
                'mean': df[column].mean(),
                'std': df[column].std(),
                'min': df[column].min(),
                'max': df[column].max(),
                'quantiles': df[column].quantile([0.25, 0.5, 0.75]).to_dict()
            }
        else:
            distributions[column] = {
                'unique_values': df[column].nunique(),
                'mode': df[column].mode()[0],
                'mode_count': df[column].value_counts().iloc[0],
                'value_counts': df[column].value_counts(normalize=True).to_dict()
            }

    return distributions



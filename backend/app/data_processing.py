import os
import json
import joblib
import scipy.stats
import sklearn.cluster as skc
import sklearn.compose as skcompose
import sklearn.preprocessing as skp
import sklearn.utils as sku
import sklearn.decomposition as skd
from mpmath.ctx_mp_python import return_mpc
from sklearn.cluster import KMeans, dbscan
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
import sklearn.manifold as skm
import pandas as pd
import numpy as np
import umap
from typing import Dict, List, Tuple
from safe_csv import safe_read_csv
from pandas.api.types import is_numeric_dtype


def convert_correlation_dict(corr_dict):
    result = []
    for col_name, inner_dict in corr_dict.items():
        data_points = [value for other_col, value in inner_dict.items()]
        result.append(data_points)
    return result


def create_simplified_df_for_unsupervised_clustering(config : Dict):
    """
    Create a simplified 2D dataframe for visualization.
    """
    df = safe_read_csv(config['data_path'])
    if len(df) == 0:
        raise ValueError("The DataFrame has no rows. Please check the data path and content.")

    # Apply dim-reduction if the feature count is greater than 2
    # Deprecated: Dimensionality reduction is not applied any more, but kept for reference.
    """ fc = len(df.columns) - 1 # -1 for target column

    if fc >= 3:
        from sklearn.pipeline import Pipeline

        target_col = config['target']
        pipeline = Pipeline([
            ('scalar', skp.StandardScaler()),
            ('pca', skd.PCA(n_components=2))
        ])

        X = pipeline.fit_transform(df.drop(columns=[target_col]))
        df_viz = pd.DataFrame(X, columns=['PC1', 'PC2'], index=df.index)
        df_viz[target_col] = df[target_col] """

    df_viz : pd.DataFrame = df.copy()
    # Re-Sample the dataframe to reduce size if necessary
    if config['problem_type'] == 'regress':
        df_viz = sku.resample(df_viz, n_samples=min(len(df_viz), config['n_samples']), random_state=config['random_state'])
    else:
        df_viz, _ = train_test_split(df_viz, stratify=df[config['target']], train_size=min(len(df_viz) - 20, config['n_samples']), random_state=config['random_state'])

    # The file is now called reduced_data.csv. (previously data_usc.csv)
    unsupervised_clustering_path = config.get('wfDir', '') + '\\reduced_data.csv'

    df_viz.to_csv(unsupervised_clustering_path, index=False)
    return True


def create_a_sample_df(config : Dict):
    """
    Create a sample dataframe for visualization.
    """
    df = safe_read_csv(config['data_path'])
    if len(df) == 0:
        raise ValueError("The DataFrame has no rows. Please check the data path and content.")

    # Re-Sample the dataframe to reduce size if necessary
    if config['problem_type'] == 'regress':
        df = df.sample(n=min(len(df), config['n_samples']), random_state=config['random_state'])
    else:
        df, _ = train_test_split(df, stratify=df[config['target']], train_size=min(len(df) - 20, config['n_samples']), random_state=config['random_state'])
    
    # Drop target column if it exists
    df : pd.DataFrame = df.drop(columns=[config.get('target')], errors='ignore') 
    return df


def convert_ndarray_to_dict(ndarray: np.ndarray, columns: List[str] = None) -> Dict[str, List[float]]:
    """
    Convert a NumPy ndarray to a dictionary with column names as keys.
    """
    if columns is None:
        columns = [f'C_{i}' for i in range(ndarray.shape[1])]

    if ndarray.ndim != 2 or len(columns) != ndarray.shape[1]:
        raise ValueError("ndarray must be 2D and match the number of columns provided.")
    
    return {columns[i]: ndarray[:, i].tolist() for i in range(ndarray.shape[1])}


def unsupervised_clustering(config : Dict):
    """
    Perform clustering on the data specified in config
    """
    data_file = '\\data_usc.csv' if config.get('dim', 2) == 2 else '\\pca_2d.csv'
    unsupervised_clustering_path = config.get('wfDir', '') + data_file
    df = safe_read_csv(unsupervised_clustering_path)
    if len(df) == 0:
        raise ValueError("The DataFrame has no rows. Please check the data path and content.")

    '''
    Method used to compute the unsupervised model.
    Supported methods: 'kmeans', 'agglomerative', 'dbscan', 'birch'
    '''
    method = config['method']
    nclusters = config.get('n_clusters', 3)
    result = {
        'x1' : df['PC1'].tolist(),
        'x2' : df['PC2'].tolist()
    }
    if method == 'kmeans':
        kmc = skc.KMeans(n_clusters=nclusters)
        y = kmc.fit_predict(X=df)
        result['y'] = y.tolist()
        return result
    elif method == 'agglomerative':
        agg = skc.AgglomerativeClustering(n_clusters=nclusters)
        y = agg.fit_predict(df)
        result['y'] = y.tolist()
        return result
    elif method == 'dbscan':
        dbscan = skc.HDBSCAN()
        y = dbscan.fit_predict(df)
        result['y'] = y.tolist()
        return result
    elif method == 'birch':
        birch = skc.Birch(n_clusters=nclusters)
        y = birch.fit_predict(df)
        result['y'] = y.tolist()
        return result
    else:
        raise ValueError(f"Unsupported method: {method}. Supported methods are 'kmeans', 'agglomerative', 'dbscan', 'birch'.")


def dimensionality_reduction(config : Dict, df : pd.DataFrame = None):
    """
    Perform dimensionality reduction on the given configuration.
    """
    
    if df is None:
        df = safe_read_csv(config['data_path'])
        if len(df) == 0:
            raise ValueError("The DataFrame has no rows. Please check the data path and content.")

        # Re-Sample the dataframe to reduce size if necessary
        if config['problem_type'] == 'regress':
            df = df.sample(n=min(len(df), config['n_samples']), random_state=config['random_state'])
        else:
            df, _ = train_test_split(df, stratify=df[config['target']], train_size=min(len(df) - 20, config['n_samples']), random_state=config['random_state'])
        
        # Drop target column if it exists
        df : pd.DataFrame = df.drop(columns=[config.get('target')], errors='ignore') 

    '''
    Method used to compute the unsupervised model.
    Supported methods: 'umap', 'pca', 'isomap', 'lle', 'mds', 'ica'
    '''
    method = config['method']
    
    if method == 'umap':
        # Ensure 'n_components' is set, default to 2 if not provided
        n_components = config.get('n_components', 2)
        reducer = umap.UMAP(n_components=n_components, n_jobs=-1)
        embedding = reducer.fit_transform(df)
        cols = [f'Dim_{i}' for i in range(n_components)]
        return {
            'embedded' : convert_ndarray_to_dict(embedding, cols)
            }
    elif method == 'pca':
        n_components = config.get('n_components', 2)
        pca = skd.PCA(n_components=n_components, random_state=config['random_state'])
        embedding = pca.fit_transform(df)
        cols = [f'PC_{i}' for i in range(n_components)]
        return {
            'embedded': convert_ndarray_to_dict(embedding, cols),
            'explained_variance': pca.explained_variance_.tolist(),
            'explained_variance_ratio': pca.explained_variance_ratio_.tolist(),
            'components': pca.components_.tolist()
        }
    elif method == 'ica':
        n_components = config.get('n_components', 2)
        ica = skd.FastICA(n_components=n_components, random_state=config['random_state'])
        embedding = ica.fit_transform(df)
        cols = [f'IC_{i}' for i in range(n_components)]
        return {
            'embedded': convert_ndarray_to_dict(embedding, cols),
            'components': ica.components_.tolist(),
            'mean': ica.mean_.tolist(),
        }
    elif method == 'isomap':
        n_components = config.get('n_components', 2)
        isomap = skm.Isomap(n_components=n_components, n_jobs=-1)
        embedding = isomap.fit_transform(df)
        cols = [f'Dim_{i}' for i in range(n_components)]
        return {
            'embedded': convert_ndarray_to_dict(embedding, cols),
        }
    elif method == 'lle':
        n_components = config.get('n_components', 2)
        lle = skm.LocallyLinearEmbedding(n_components=n_components, n_jobs=-1)
        embedding = lle.fit_transform(df)
        cols = [f'Dim_{i}' for i in range(n_components)]
        return {
            'embedded': convert_ndarray_to_dict(embedding, cols),
        }
    elif method == 'mds':
        n_components = config.get('n_components', 2)
        mds = skm.MDS(n_components=n_components, n_jobs=-1)
        embedding = mds.fit_transform(df)
        cols = [f'Dim_{i}' for i in range(n_components)]
        return {
            'embedded': convert_ndarray_to_dict(embedding, cols),
        }
    else:
        raise ValueError(f"Unsupported method: {method}. Supported methods are 'umap', 'pca', 'ica', 'isomap', 'lle', 'mds'.")


def compute_dataset_statistics(config : Dict):
    """
    Compute basic statistics of the dataset.
    """
    df = safe_read_csv(config['data_path'])
    if len(df) == 0:
        raise ValueError("The DataFrame has no rows. Please check the data path and content.")
    dtypes = {}
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]) and df[col].nunique() >= 20:
            dtypes[col] = 'Continuous'
        else:
            dtypes[col] = 'Discrete'
    # Compute basic statistics
    stats = {
        'row_count': df.shape[0],
        'column_count': df.shape[1],
        'columns': df.columns.tolist(),
        'dtypes': dtypes,
        'memory_usage': df.memory_usage(deep=True).to_dict(),
        'missing_values': df.isnull().sum().to_dict(),
        'sample_data': df.sample(n=min(5, len(df))).to_dict(orient='records'),
    }

    return stats

def compute_relationships(config : Dict):
    """
    Compute relationships between features in the dataset.
    """
    df = safe_read_csv(config['data_path'])

    if df.empty:
        raise ValueError("The DataFrame is empty. Please check the data path and content.")

    # Ensure the DataFrame has numeric columns for correlation
    corr_pearson = df.corr(method='pearson')
    corr_spearman = df.corr(method='spearman')

    # Normalize the correlation matrix
    # corr_pearson = skp.normalize(corr_pearson, axis=0)
    # corr_spearman = skp.normalize(corr_spearman, axis=0)

    high_corr_features = []
    # Check if any features are highly correlated (corr >= 0.7) to 'target' column
    target = config.get('target')
    if target and target in df.columns:
        high_corr_features = corr_spearman[target][corr_spearman[target] >= 0.7].index.tolist()
    
    if config.get('target') in high_corr_features:
        high_corr_features.remove(config.get('target'))

    # Compute interactions between features (i.e. High correlation between features)
    interactions = []
    for i in range(len(corr_spearman.columns)):
        for j in range(i + 1, len(corr_spearman.columns)):
            if abs(corr_spearman.iloc[i, j]) >= 0.7 and (corr_spearman.columns[i] != target or corr_spearman.columns[j] != target):
                msg = f'Features {corr_spearman.columns[i]} and {corr_spearman.columns[j]} have high correlation: {corr_spearman.iloc[i, j]}'
                #interactions.append((corr_spearman.columns[i], corr_spearman.columns[j], float(corr_spearman.iloc[i, j])))
                interactions.append(msg)

    # Compute MDI for feature importance
    if config['problem_type'] == 'regress':
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
        'correlationPearson': convert_correlation_dict(corr_pearson.to_dict()),
        'correlationSpearman': convert_correlation_dict(corr_spearman.to_dict()),
        'highCorrelationFeatures': high_corr_features,
        'interactions': interactions,
        'featureImportance': importance_df
    }


def compute_distributions(config : Dict):
    """
    Compute box plots for numerical (continuous) features and
    compute stacked bar charts for categorical (discrete numeric) features.
    """
    df = safe_read_csv(config['data_path'])

    if df.empty:
        raise ValueError("The DataFrame is empty. Please check the data path and content.")

    distributions = {}
    
    for column in df.columns:
        if pd.api.types.is_numeric_dtype(df[column]) and df[column].nunique() >= 20:
            q1 = float(df[column].quantile(0.25))
            q2 = float(df[column].quantile(0.5))
            q3 = float(df[column].quantile(0.75))
            distributions[column] = {
                'type': 'continuous',
                'mean': float(df[column].mean()),
                'std' : float(df[column].std()),
                'skewness': float(df[column].skew()),
                'kurtosis': float(df[column].kurtosis()),
                'min': float(df[column].min()),
                'max': float(df[column].max()),
                'q1' : q1,
                'q2' : q2,
                'q3' : q3,
                'outliers_lower' : q2 - 1.5 * (q3 - q1),
                'outliers_upper' : q2 + 1.5 * (q3 - q1)
            }
        else:
            distributions[column] = {
                'type': 'discrete',
                'unique_values': int(df[column].nunique()),
                'mode': f'{df[column].mode()[0]}',
                'mode_count': int(df[column].value_counts().iloc[0]),
                'value_counts': df[column].value_counts(normalize=True).to_dict()
            }

    return distributions


def get_reduced_sample(config : Dict):
    df = safe_read_csv(config['data_path'])

    if config['problem_type'] == 'regress':
        df = df.sample(n=min(len(df), config['n_samples']), random_state=config['random_state'])
    else:
        df, _ = train_test_split(df, stratify=df[config['target']], train_size=min(len(df) - 20, config['n_samples']), random_state=config['random_state'])

    reduced_sample = {}
    for col in df.columns:
        if df[col].nunique() >= 20:
            reduced_sample[col] = {
                'type': 'continuous',
                'values': df[col].tolist()
            }
        else:
            reduced_sample[col] = {
                'type': 'discrete',
                'values': df[col].tolist()
            }
    
    return reduced_sample


'''
config_example = {
    'data_path': 'path/to/your/data.csv',
    'problem_type': 'regression',  # or 'classification'
    'target': 'target_column_name',  # Optional, only for supervised tasks
    'n_samples': 1000,  # Number of samples to use
    'random_state': 42,
    'method': 'umap',  # or 'pca', 'kmeans', 'isomap', 'lle', 'mds', 'ica'
    'n_components': 2,  # For UMAP and PCA
    'n_clusters': 3,  # For KMeans
}
'''

def compute_and_save_dataset_stats(config : Dict):
    try:
        stats = compute_dataset_statistics(config)
        distributions = compute_distributions(config)
        relations = compute_relationships(config)

        save_location = config.get('wfDir', '') + '\\edadata.json'
        import json
        # Ensure the directory exists
        import os
        os.makedirs(os.path.dirname(save_location), exist_ok=True)

        from data_analysis import compute_feature_summaries, target_column_summary
        df = safe_read_csv(config['data_path'])
        feature_summaries, all_recs, outlier_list = compute_feature_summaries(df, config.get('target'))

        summary = {
            'featureSummaries': feature_summaries,
            'problemType': 'classify', # WARNING
            'recommendations': all_recs,
            'outliers': outlier_list,
        }

        json = json.dumps({
            'statistics': stats,
            'distributions': distributions,
            'relationships': relations,
            'summary': summary,
            'reducedSample': get_reduced_sample(config)
        })
        with open(save_location, 'w') as f:
            f.write(json)

        return True

    except Exception as e:
        print(f"Error computing and saving dataset stats: {e}")
        return False
    


def compute_and_store_dim_redux(config : Dict):

    # This is now deprecated, but kept for consistency.
    """ methods = 'umap', 'pca', 'ica', 'isomap', 'lle', 'mds'
    try:
        common_df = create_a_sample_df(config)
        for method in methods:
            for n_components in (2,3):
                config['method'] = method
                config['n_components'] = n_components
                embedding = dimensionality_reduction(config, common_df)
                save_location = config.get('wfDir', '') + f'/{method}_{n_components}d.json'
                import json
                # Ensure the directory exists
                import os
                os.makedirs(os.path.dirname(save_location), exist_ok=True)

                json = json.dumps(embedding)
                with open(save_location, 'w') as f:
                    f.write(json)
    """
    return True

    
    

def compute_stats_and_dim_redux(config : Dict):
    try:
        stats = compute_and_save_dataset_stats(config)
        dim_redux = compute_and_store_dim_redux(config)
        return stats and dim_redux
    except Exception as e:
        print(f"Error computing and storing stats and dimensionality reduction: {e}")
        return False


def fill_missing_values(df : pd.DataFrame, method : str):
    # Make a copy to avoid modifying the original DataFrame in-place
    import sklearn.impute as skim
    df_copy = df.copy()

    if method == 'none':
        return df_copy
    
    # Validate the method for numeric columns
    numeric_imputer_strategy = None
    if method == 'mean':
        numeric_imputer_strategy = 'mean'
    elif method == 'median':
        numeric_imputer_strategy = 'median'
    elif method == 'mode':
        numeric_imputer_strategy = 'most_frequent'
    else:
        raise ValueError(f"Invalid method: '{method}'. Must be 'none', 'mean', 'median', or 'mode'.")

    for col in df_copy.columns:
        if is_numeric_dtype(df_copy[col]):
            imputer = skim.SimpleImputer(strategy=numeric_imputer_strategy)
            # Flatten the 2D output of fit_transform to 1D
            df_copy[col] = imputer.fit_transform(df_copy[[col]]).ravel()
            # Alternatively: df_copy[col] = imputer.fit_transform(df_copy[[col]])[:, 0]
        elif df_copy[col].dtype == 'object' or df_copy[col].dtype == 'category' or df_copy[col].dtype == 'string':
            imputer = skim.SimpleImputer(strategy='most_frequent')
            # Flatten the 2D output of fit_transform to 1D
            df_copy[col] = imputer.fit_transform(df_copy[[col]]).ravel()
            # Alternatively: df_copy[col] = imputer.fit_transform(df_copy[[col]])[:, 0]
            
    return df_copy


def apply_preprocess_to_dataset(config : Dict):
    """
    Apply preprocessing to the dataset.
    Step1: Encode categorical columns if any
    Step2: Store the dataset metadata
    Step3: Fill missing values
    Step4: Scale the dataset
    Step5: Remove outliers and store the outlier indices
    Step6: Store the preprocessed dataset
    Step7: Create and store train-test split
    """
    df = safe_read_csv(config['data_path'])
    if df.empty:
        raise ValueError("The DataFrame is empty. Please check the data path and content.")
    
    scaling_strategy = config.get('scale', 'none')
    df = fill_missing_values(df, config.get('impute', 'mean'))
    preprocess_dataframe(df, config.get('target'), config.get('wfDir'), test_size=0.2, random_state=42, encoding_strategy='ordinal', scaling_strategy=scaling_strategy)

    json.dump({}, open(config.get('wfDir', '') + '\\metadata.json', 'w'))
    return True



def preprocess_dataframe(df: pd.DataFrame, target_column, wfDir, test_size=0.2, random_state=42, encoding_strategy='ordinal', scaling_strategy='none'):
    """
    Splits a pandas DataFrame into train/test sets, separates numerical and categorical columns,
    applies encoding to categorical columns, and scaling to numerical columns.

    Args:
        df (pd.DataFrame): The input pandas DataFrame.
        target_column (str): The name of the target column.
        test_size (float): The proportion of the dataset to include in the test split (default is 0.2).
        random_state (int): Controls the shuffling applied to the data before applying the split (default is 42).
        encoding_strategy (str): 'label' for LabelEncoder (for single columns) or 'ordinal' for OrdinalEncoder (for multiple columns).
    """
    
    preprocessor_path = wfDir + '\\preprocessor.joblib'
    target_encoder_path = wfDir + '\\target_encoder.joblib'

    # 1. Split into train and test sets (2:8 ratio)
    X = df.drop(columns=[target_column])
    y = df[target_column]

    if y.nunique() < 20:
        print(f"Stratifying the split based on target column '{target_column}' with {y.nunique()} unique values.")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, stratify=y, random_state=random_state)
    else:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)

    # 1.1 Encode the target variable
    if df[target_column].dtype == 'object' or df[target_column].dtype == 'category' or df[target_column].dtype == 'string':
        encode_target = True
        target_encoder = skp.LabelEncoder()
        y_train = target_encoder.fit_transform(y_train)
        y_test = target_encoder.transform(y_test)
        y = target_encoder.transform(y)
    else:
        encode_target = False

    # 2. Separate categorical and numerical columns
    categorical_features = X_train.select_dtypes(include=['object', 'category']).columns.tolist()
    categorical_encoded_features = []
    numerical_features = X_train.select_dtypes(include=np.number).columns.tolist()

    for col in numerical_features:
        if df[col].nunique() <= 20:
            numerical_features.remove(col)
            categorical_encoded_features.append(col)

    # 3. Apply Label/Ordinal Encoder to categorical columns and Standard Scaler to numerical columns
    transformers = []

    if numerical_features:
        if scaling_strategy == 'none':
            pass
        elif scaling_strategy == 'standardize':
            transformers.append(('num', skp.StandardScaler(), numerical_features))
        elif scaling_strategy == 'normalize':
            transformers.append(('num', skp.MinMaxScaler(), numerical_features))
        else:
            raise ValueError(f"Unsupported scaling strategy: {scaling_strategy}. Supported strategies are 'none', 'standardize', 'normalize'.")

    if categorical_features:
        transformers.append(('cat', skp.OrdinalEncoder(handle_unknown='error'), categorical_features))

    preprocessor = skcompose.ColumnTransformer(transformers=transformers, remainder='passthrough')

    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    df_processed = preprocessor.transform(X)

    categorical_features.extend(categorical_encoded_features)

    # Get the names of the transformed columns for DataFrame conversion
    transformed_column_names = []
    if numerical_features:
        transformed_column_names.extend([f'{col}' for col in numerical_features])
    if categorical_features:
        transformed_column_names.extend([f'{col}' for col in categorical_features])
        
    X_train_processed = pd.DataFrame(X_train_processed, columns=transformed_column_names, index=X_train.index)
    X_test_processed = pd.DataFrame(X_test_processed, columns=transformed_column_names, index=X_test.index)
    y_train_processed = pd.Series(y_train, name='target', index=X_train.index)
    y_test_processed = pd.Series(y_test, name='target', index=X_test.index)
    df_processed = pd.DataFrame(df_processed, columns=transformed_column_names, index=df.index)
    df_processed[target_column] = y

    joblib.dump(preprocessor, preprocessor_path)
    if encode_target:
        joblib.dump(target_encoder, target_encoder_path)
    
    Xtrain_loc = wfDir + '\\Xtrain.csv'
    Xtest_loc = wfDir + '\\Xtest.csv'
    ytrain_loc = wfDir + '\\ytrain.csv'
    ytest_loc = wfDir + '\\ytest.csv'
    df_proc_loc = wfDir + '\\data.csv' # Replaces the original data
    df_orig_loc = wfDir + '\\data_original.csv'

    df.to_csv(df_orig_loc, index=False)
    X_train_processed.to_csv(Xtrain_loc, index=False)
    X_test_processed.to_csv(Xtest_loc, index=False)
    y_train_processed.to_csv(ytrain_loc, index=False)
    y_test_processed.to_csv(ytest_loc, index=False)
    df_processed.to_csv(df_proc_loc, index=False)

    dataset_metadata = {
        'rows': df.shape[0],
        'columns': transformed_column_names,
        'columnTypes': {col: 'cat' if col in categorical_features else 'num' for col in transformed_column_names},
        'numericalInfo': {col: {'min': df[col].min(), 'max': df[col].max()} for col in numerical_features},
        'categoricalInfo': {col: {'values': df[col].unique().tolist()} for col in categorical_features},
        'preprocessorPath': preprocessor_path,
        'targetEncoderPath': target_encoder_path if encode_target else None
    }

    dataset_metadata_path = wfDir + '\\dataset_metadata.json'
    os.makedirs(os.path.dirname(dataset_metadata_path), exist_ok=True)
    with open(dataset_metadata_path, 'w') as f:
        json.dump(dataset_metadata, f)

    return True

def create_store_train_test_split(config : Dict):
    df = safe_read_csv(config['data_path'])
    if df.empty:
        raise ValueError("The DataFrame is empty. Please check the data path and content.")
    
    
    X = df.drop(columns=[config.get('target')], errors='ignore')
    y = df[config.get('target')]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    Xtrain_loc = config.get('wfDir', '') + '\\Xtrain.csv'
    Xtest_loc = config.get('wfDir', '') + '\\Xtest.csv'
    ytrain_loc = config.get('wfDir', '') + '\\ytrain.csv'
    ytest_loc = config.get('wfDir', '') + '\\ytest.csv'

    X_train.to_csv(Xtrain_loc, index=False)
    X_test.to_csv(Xtest_loc, index=False)
    y_train.to_csv(ytrain_loc, index=False)
    y_test.to_csv(ytest_loc, index=False)

    return True
    

""" 
config_example = {
    'data_path': 'C:\\Users\\Tharuka\\Downloads\\winequality-white.csv',
    'problem_type': 'regression',  # or 'classification'
    'target': 'target_column_name',  # Optional, only for supervised tasks
    'n_samples': 1000,  # Number of samples to use
    'random_state': 42,
    'wfDir': 'C:\\Users\\Tharuka\\Downloads\\test',
}


compute_and_store_dim_redux(config_example)
 """
import pandas as pd
import sklearn.datasets as skd
import umap
import numpy as np
from scipy.stats import gaussian_kde


def compute_feature_summaries(df : pd.DataFrame):
    """
    Compute summary statistics for each feature in the DataFrame.
    """
    summaries = []
    idx = 1
    for column in df.columns:
        missing_percent = df[column].isnull().sum() * 100 / len(df)
        if pd.api.types.is_numeric_dtype(df[column]):
            min = df[column].min()
            max = df[column].max()
            summaries.append({
                'key': f'{idx}', 
                'name': column, 
                'type': 'Numeric', 
                'missing_percent': f'{missing_percent:.2f}%', 
                'central': f'Mean: {df[column].mean():.2f}', 
                'dispersion': f'StdDev: {df[column].std():.2f}', 
                'range': f'Min: {min:2} - Max: {max:.2f}'
            })
        else:
            mode = df[column].mode()[0]
            unique_count = df[column].nunique()
            mode_freq = df[column].value_counts().iloc[0] * 100 / len(df)
            summaries.append({
                'key': f'{idx}', 
                'name': column, 
                'type': 'Categorical', 
                'missing_percent': f'{missing_percent:.2f}%', 
                'central': f"Mode: '{mode}'", 
                'dispersion': f'UniqueCount: {unique_count}',
                'range': f'ModeFreq: {mode_freq:.1f}%'
            })
        idx += 1
    return summaries


def target_column_summary(df : pd.DataFrame, target_column : str):
    """
    Compute summary statistics for the target column in the DataFrame.
    """
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in DataFrame.")
    
    if pd.api.types.is_numeric_dtype(df[target_column]):
        min = df[target_column].min()
        max = df[target_column].max()

        # If numeric, return statistics, KDE points X, and KDE points Y
        kde = gaussian_kde(df[target_column], bw_method='scott')
        x = np.linspace(min, max, 100)
        y = kde(x)
        return {
            'key': '0',
            'name': target_column,
            'type': 'Numeric',
            'missing_percent': f'{df[target_column].isnull().sum() * 100 / len(df):.2f}%',
            'central': f'Mean: {df[target_column].mean():.2f}',
            'dispersion': f'StdDev: {df[target_column].std():.2f}',
            'range': f'Min: {min:.2f} - Max: {max:.2f}',
        }, x.tolist() , y.tolist()
    else:
        mode = df[target_column].mode()[0]
        unique_count = df[target_column].nunique()
        mode_freq = df[target_column].value_counts().iloc[0] * 100 / len(df)

        # If categorical, return statistics, and each unique value with its frequency
        unique_values = df[target_column].value_counts(normalize=True).to_dict()
        return {
            'key': '0',
            'name': target_column,
            'type': 'Categorical',
            'missing_percent': f'{df[target_column].isnull().sum() * 100 / len(df):.2f}%',
            'central': f"Mode: '{mode}'",
            'dispersion': f'UniqueCount: {unique_count}',
            'range': f'ModeFreq: {mode_freq:.1f}%',
        }, unique_values, None


def generate_file_summary_report(file_path : str, target_column : str):
    """
    Generate a summary report for a given file path.
    """
    # Read the dataset
    df = pd.read_csv(file_path)

    # Check if the DataFrame is empty
    if df.empty:
        print("The DataFrame is empty. Please check the file path and content.")
        raise ValueError("The DataFrame is empty. Please check the file path and content.")
    
    # Compute feature summaries and target column summary
    feature_summaries = compute_feature_summaries(df)
    taget_sum, arg1, arg2 = target_column_summary(df, target_column)

    summary = {
        'featureSummaries': feature_summaries,
        'targetSummary': taget_sum,
        'targetKDEx': arg1,
        'targetKDEy': arg2,
        'treeMapData': arg1
    }
    
    return summary
import pandas as pd
import sklearn.datasets as skd
from sklearn.ensemble import IsolationForest
import umap
import numpy as np
from scipy.stats import gaussian_kde
from data_cleanup import basic_data_cleanup
from safe_csv import safe_read_csv


def get_outliers_as_list(df: pd.DataFrame) -> dict:
    """
    Check for outliers in the DataFrame using Isolation Forest.
    Expects a DataFrame without the target column.
    Only considers continuous numeric columns for outlier detection.
    """
    if df.empty:
        return {'outliers': [], 'umap': None}
    
    cols_to_drop = []
    for col in df.columns:
        if df[col].nunique() < 20:
            cols_to_drop.append(col)
    
    numeric_df = df.drop(columns=cols_to_drop)

    # Fit Isolation Forest to detect outliers
    iso_forest = IsolationForest()
    iso_forest.fit(numeric_df)
    is_outlier = iso_forest.predict(numeric_df) == -1
    
    # Create a list of outlier indices
    outlier_indices = numeric_df.index[is_outlier].tolist()

    return outlier_indices


def should_scale_data(df: pd.DataFrame) -> bool:
    """
    Evaluates whether the DataFrame should be scaled.
    Checks if the continuous numeric columns have a wide range of values between each other using their span and standard deviation.
    Returns True if scaling is recommended, False otherwise.
    """
    if df.empty:
        return {'outliers': [], 'umap': None}
    
    cols_to_drop = []
    for col in df.columns:
        if df[col].nunique() < 20:
            cols_to_drop.append(col)
    
    numeric_df = df.drop(columns=cols_to_drop)

    if numeric_df.empty:
        return False
    
    ranges = []
    for col in numeric_df.columns:
        ranges.append(numeric_df[col].max() - numeric_df[col].min())
    
    spans = np.array(ranges)
    span_ratio = spans.max() / spans.min()
    stds = np.std(numeric_df, axis=0)
    std_ratio = stds.max() / stds.min()

    if span_ratio > 10 or std_ratio > 10:
        return True
    
    return False



def compute_feature_summaries(df : pd.DataFrame, target_column : str = None):
    """
    Compute summary statistics for each feature in the DataFrame.
    """
    summaries = []
    idx = 1
    all_recs = []
    specific_recs = {}

    outlier_list = get_outliers_as_list(df)
    should_scale = should_scale_data(df)
    if len(outlier_list) > 0:
        all_recs.append('outliers')
    if should_scale:
        all_recs.append('scale')

    for column in df.columns:

        missing_percent = df[column].isnull().sum() * 100 / len(df)
        if pd.api.types.is_numeric_dtype(df[column]) and df[column].nunique() >= 20:
            min = df[column].min()
            max = df[column].max()

            # If numeric, return statistics, KDE points X, and KDE points Y
            kde = gaussian_kde(df[column], bw_method='scott')
            x = np.linspace(min, max, 100)
            y = kde(x)
            kde_data = [{'x': x[i], 'y': y[i]} for i in range(len(x))]
            summaries.append({
                'key': f'{idx}', 
                'name': f'{column} (Target)' if column == target_column else column, 
                'type': 'Numeric', 
                'missing_percent': f'{missing_percent:.2f}%', 
                'central': f'Mean: {df[column].mean():.2f}', 
                'dispersion': f'StdDev: {df[column].std():.2f}', 
                'range': f'Min: {min:.2f} - Max: {max:.2f}',
                'dist' : kde_data
            })
        else:
            mode = df[column].mode()[0]
            unique_count = df[column].nunique()
            mode_freq = df[column].value_counts().iloc[0] * 100 / len(df)
            # If categorical, return statistics, and each unique value with its frequency
            unique_values = df[column].value_counts(normalize=True).to_dict()
            class_data = [{'name': str(value), 'value': freq * 100} for i, (value, freq) in enumerate(unique_values.items())]

            summaries.append({
                'key': f'{idx}', 
                'name': column, 
                'type': 'Categorical', 
                'missing_percent': f'{missing_percent:.2f}%', 
                'central': f"Mode: '{mode}'", 
                'dispersion': f'UniqueCount: {unique_count}',
                'range': f'ModeFreq: {mode_freq:.1f}%',
                'dist': class_data
            })
        idx += 1
    return summaries, all_recs, outlier_list


def target_column_summary(df : pd.DataFrame, target_column : str, problem_type : str):
    """
    Compute summary statistics for the target column in the DataFrame.
    """
    
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in DataFrame.")
    
    ttype = problem_type
    if problem_type == 'classify':
        ttype = 'cls'
    elif problem_type == 'regress':
        ttype = 'reg'
    elif pd.api.types.is_numeric_dtype(df[target_column]):
        if df[target_column].nunique() < 20:
            # If numeric but few unique values, treat as categorical
            ttype = 'cls'
        else:
            ttype = 'reg'
    else:
        ttype = 'cls'
    
    return 'regress' if ttype == 'reg' else 'classify'

    # --------------------------------REMOVED--------------------------------------#

    """ if ttype == 'reg':
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
        }, x.tolist() , y.tolist(), ('regress' if ttype == 'reg' else 'classify')
    else:
        mode = df[target_column].mode()[0]
        unique_count = df[target_column].nunique()
        mode_freq = df[target_column].value_counts().iloc[0] * 100 / len(df)

        # If categorical, return statistics, and each unique value with its frequency
        unique_values = df[target_column].value_counts(normalize=True).to_dict()
        tree_map_data = [{'name': str(value), 'value': freq * 100} for i, (value, freq) in enumerate(unique_values.items())]
        return {
            'key': '0',
            'name': target_column,
            'type': 'Categorical',
            'missing_percent': f'{df[target_column].isnull().sum() * 100 / len(df):.2f}%',
            'central': f"Mode: '{mode}'",
            'dispersion': f'UniqueCount: {unique_count}',
            'range': f'ModeFreq: {mode_freq:.1f}%',
        }, tree_map_data, None, ('regress' if ttype == 'reg' else 'classify') """


def generate_file_summary_report(file_path : str, target_column : str, problem_type : str) -> dict:
    """
    Generate a summary report for a given file path.
    """
    # Read the dataset
    df = safe_read_csv(file_path)

    # Check if the DataFrame is empty
    if df.empty:
        print("The DataFrame is empty. Please check the file path and content.")
        raise ValueError("The DataFrame is empty. Please check the file path and content.")

    df, actions = basic_data_cleanup(df)
    
    # Compute feature summaries and target column summary
    feature_summaries, all_recs, outlier_list = compute_feature_summaries(df, target_column)
    problem_type = target_column_summary(df, target_column, problem_type)

    summary = {
        'featureSummaries': feature_summaries,
        'problemType': problem_type,
        'recommendations': all_recs,
        'outliers': outlier_list,
    }
    
    return summary


def generate_df_summary(df : pd.DataFrame, target_column : str, problem_type : str) -> dict:
    """
    Generate a summary report for a given DataFrame.
    """
    if df.empty:
        print("The DataFrame is empty. Please check the content.")
        raise ValueError("The DataFrame is empty. Please check the content.")

    df, actions = basic_data_cleanup(df)
    
    # Compute feature summaries and target column summary
    feature_summaries = compute_feature_summaries(df, target_column)
    taget_sum, arg1, arg2 = target_column_summary(df, target_column, problem_type)

    summary = {
        'featureSummaries': feature_summaries,
        'targetSummary': taget_sum,
        'targetKDEx': arg1,
        'targetKDEy': arg2,
        'treeMapData': arg1
    }
    
    return summary
import polars as pl
from ..core.data_frame import DataFrame, DataType
import numpy as np
from typing import List, Dict, Any
from sklearn.feature_selection import SelectKBest, f_classif

def basic_analysis(data: DataFrame) -> Dict[str, Dict[str, Any]]:
    results = {
        "columns": data.columns,
        "n_rows": len(data.df),
        "n_columns": len(data.columns),
        "types": {col: data.get_type(col) for col in data.columns}
    }
    return results

def descriptive_analysis(data: DataFrame) -> Dict[str, Dict[str, Any]]:
    results = {}
    df : pl.DataFrame = data.df
    
    for column in data.columns:
        if data.get_type(column) == DataType.CATEGORICAL:
            results[column] = {
                "unique": data.df[column].n_unique(),
                "n_missing": data.df[column].null_count(),
            }
        else:
            results[column] = {
                "mean": data.df[column].mean().unwrap(),
                "std": data.df[column].std(),
                "min": data.df[column].min().unwrap(),
                "max": data.df[column].max().unwrap(),
                "median": data.df[column].median().unwrap(),
                "n_missing": data.df[column].null_count(),
            }
    return results

def feature_importance(data: DataFrame, target: str) -> Dict[str, Dict[str, Any]]:
    X = data.df.drop(target)
    y = data.df[target]
    selector = SelectKBest(f_classif, k='all')
    selector.fit(X, y)
    results = {col: selector.scores_[i] for i, col in enumerate(data.columns) if col != target}
    return results


class DataAnalyzer:
    data : DataFrame
    analytics : Dict[str, Dict[str, Any]]

    def __init__(self, path : str):
        self.data = DataFrame(path)
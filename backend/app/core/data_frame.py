import polars as pl
import numpy as np
import sklearn as sk
from typing import List, Dict, Any, Union
import re
from .file_system import *

class DataType:
    NUMERIC = 0
    CATEGORICAL = 1


class DataFrame:
    df : pl.DataFrame
    path : str
    types : Dict[str, int]
    columns : List[str]

    def __init__(self, path : str):
        self.df = pl.read_csv(path)
        self.path = path
        self.types = self.get_column_types()
        self.columns = self.df.columns

    def __getitem__(self, key: Union[str, int, slice]) -> np.ndarray:
        """
        Enable df['col'], df[0], and df[1:3] style access
        """
        if isinstance(key, str):
            return self.data[key]
        elif isinstance(key, int):
            col_name = self.columns[key]
            return self.data[col_name]
        elif isinstance(key, slice):
            return {col: self.data[col][key] for col in self.columns}
        else:
            raise KeyError(f"Invalid key type: {type(key)}")
    
    def __setitem__(self, key: Union[str, int], value: np.ndarray):
        """
        Enable df['new_col'] = array and column modification
        """
        if isinstance(key, int):
            key = self.columns[key]
        
        if key not in self.columns:
            self.columns.append(key)
        
        self.data[key] = value
        self.types[key] = value.dtype
    
    def get_type(self, column: Union[str, int]) -> int:
        """
        Get dtype of specified column
        """
        if isinstance(column, int):
            column = self.columns[column]
        return self.types[column]
    
    @property
    def columns(self) -> List[str]:
        """Return column names"""
        return self.columns
    
    @property
    def types(self) -> Dict[str, int]:
        """Return dtype mapping"""
        return self.types
    
    def get_column_types(self) -> Dict[str, int]:
        """Get dtype mapping for all columns"""
        return {col: self.get_typeof_column(col) for col in self.columns}
    
    def get_typeof_column(self, column: Union[str, int]) -> int:
        """Get dtype of specified column"""
        if self.df[column].dtype == pl.Utf8:
            return DataType.CATEGORICAL
        return DataType.NUMERIC
    
    def basic_data_cleanup(self) -> Dict[str, list[list[str]]]:
        to_drop = []
        actions : Dict[str, list[list[str]]]= {}
        self.df, actions = self.convert_numeric_or_categorical(self.df, actions)

        for col in self.df.columns:
            self.df[col] = self.convert_column(self.df[col])
            nu = self.df[col].n_unique()
            ec = self.df[col].is_nan().to_numpy().astype(int).sum()

            if nu == self.df.shape[0]:
                # Drop columns with all unique values
                to_drop.append(col)
                if not col == GLOBAL_PREDICTION_VECTOR:
                    actions[col].append(["drop", col, "Unique column."])
                else:
                    actions[col] = ["error", "Unique prediction column."]
                continue
            if ec == self.df.shape[0]:
                # Drop columns with all missing values/emtpy columns
                to_drop.append(col)
                if not col == GLOBAL_PREDICTION_VECTOR:
                    actions[col].append(["drop", col, "Empty column."])
                else:
                    actions[col] = ["error", "Empty prediction column."]
                continue
            if nu == 1:
                # Drop columns with zero variability
                to_drop.append(col)
                if not col == GLOBAL_PREDICTION_VECTOR:
                    actions[col].append(["drop", col, "Column has zero variability."])
                else:
                    actions[col] = ["error", "Empty prediction column."]
                continue
        feature_count = len(self.df.columns) - len(to_drop) - 1 # one minus for prediction column
        if feature_count == 0:
            raise ValueError("No features left after basic data cleanup")
        self.df = self.df.drop(to_drop)
        self.columns = self.df.columns
        self.types = self.get_column_types()

        return actions


    def convert_numeric_or_categorical(self, df: pl.DataFrame, actions: Dict[str, list[list[str]]]) -> tuple[pl.DataFrame, Dict[str, list[list[str]]]]:
        for col in df.columns:

            if df[col].dtype == pl.Utf8:

                numeric = df.select(pl.col(col).str.parse_float64()).to_series()
                
                if numeric.null_count() == 0:
                    df = df.with_column(numeric.alias(col))
                    self.types[col] = DataType.NUMERIC
                    actions[col].append(["convert", "numeric", "none"])
                else:
                    
                    cleaned = df[col].str.replace_all(r"[^a-zA-Z0-9]", "")
                    numeric_cleaned = cleaned.str.parse_float64()
                   
                    if numeric_cleaned.null_count() == 0:
                        df = df.with_column(numeric_cleaned.alias(col))
                        self.types[col] = DataType.NUMERIC
                        actions[col].append(["convert", "numeric", "Removed extra formattings."])
                    else:
                        # Otherwise, leave it as a categorical column.
                        # Optionally, you could explicitly convert to a categorical type:
                        # df = df.with_column(cleaned.cast(pl.Categorical).alias(col))
                        self.types[col] = DataType.CATEGORICAL
                        actions[col].append(["convert", "categorical", "none"])
        return df, actions
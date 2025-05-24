import pandas as pd
from typing import Dict, List, Tuple

# Ensure GLOBAL_PREDICTION_VECTOR and convert_column are defined in your scope
def convert_numeric_or_categorical(
    df: pd.DataFrame,
    actions: Dict[str, List[List[str]]]
) -> Tuple[pd.DataFrame, Dict[str, List[List[str]]]]:
    for col in df.columns:
        # only process object/string columns
        if pd.api.types.is_object_dtype(df[col].dtype) or pd.api.types.is_string_dtype(df[col].dtype):
            # try direct numeric conversion
            numeric = pd.to_numeric(df[col], errors='coerce')
            # if no nulls, fully numeric
            if numeric.isna().sum() == 0:
                df[col] = numeric
                actions.setdefault(col, []).append(["convert", "numeric", "none"])
            else:
                # strip non-alphanumeric then retry
                cleaned = df[col].astype(str).str.replace(r"[^a-zA-Z0-9]", "", regex=True)
                numeric_cleaned = pd.to_numeric(cleaned, errors='coerce')
                if numeric_cleaned.isna().sum() == 0:
                    df[col] = numeric_cleaned
                    actions.setdefault(col, []).append([
                        "convert", "numeric", "Removed extra formattings."
                    ])
                else:
                    # leave as categorical
                    actions.setdefault(col, []).append([
                        "convert", "categorical", "none"
                    ])
    return df, actions


def basic_data_cleanup(df: pd.DataFrame) -> pd.DataFrame:
    to_drop: List[str] = []
    actions: Dict[str, List[List[str]]] = {}

    # first convert any string columns to numeric or categorical
    df, actions = convert_numeric_or_categorical(df, actions)

    for col in df.columns:
        # ensure actions entry exists
        actions.setdefault(col, [])
        # apply any custom conversion per column if needed
        # df[col] = convert_column(df[col])

        nu = df[col].nunique(dropna=False)
        ec = df[col].isna().sum()

        # all unique values (no duplicates)
        if nu == df.shape[0]:
            to_drop.append(col)
            """ if col != GLOBAL_PREDICTION_VECTOR:
                actions[col].append(["drop", col, "Unique column."])
            else:
                actions[col] = ["error", "Unique prediction column."]
            continue """

        # all missing values / empty column
        if ec == df.shape[0]:
            to_drop.append(col)
            """ if col != GLOBAL_PREDICTION_VECTOR:
                actions[col].append(["drop", col, "Empty column."])
            else:
                actions[col] = ["error", "Empty prediction column."]
            continue
 """
        # zero variability
        if nu == 1:
            to_drop.append(col)
            """ if col != GLOBAL_PREDICTION_VECTOR:
                actions[col].append(["drop", col, "Column has zero variability."])
            else:
                actions[col] = ["error", "Empty prediction column."]
            continue """

    # ensure at least one feature besides prediction remains
    feature_count = len(df.columns) - len(to_drop) - 1
    if feature_count == 0:
        raise ValueError("No features left after basic data cleanup")

    # drop flagged columns
    df = df.drop(columns=to_drop)
    return df, actions
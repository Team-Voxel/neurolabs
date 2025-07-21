import numpy as np
import pandas as pd
import statsmodels.api as sm
from ..core.data_frame import DataFrame, Type
from typing import Any, Dict, List
import scipy.stats as scp


class DFOperation:
    issue: str
    fix: str
    action: list[str]

    def __init__(self, issue, fix, action):
        self.issue = issue
        self.fix = fix
        self.action = action


def little_mcar_test(data, alpha=0.05) -> float:
    """
    Performs Little's MCAR (Missing Completely At Random) test on a dataset with missing values.

    Parameters:
    data (DataFrame): A pandas DataFrame with n observations and p variables, where some values are missing.
    alpha (float): The significance level for the hypothesis test (default is 0.05).

    Returns:
    - p-value representing the significance of the MCAR test.
    """

    # Calculate the proportion of missing values in each variable
    p_m = data.isnull().mean()

    # Calculate the proportion of complete cases for each variable
    p_c = data.dropna().shape[0] / data.shape[0]

    # Calculate the correlation matrix for all pairs of variables that have complete cases
    R_c = data.dropna().corr()

    # Calculate the correlation matrix for all pairs of variables using all observations
    R_all = data.corr()

    # Calculate the difference between the two correlation matrices
    R_diff = R_all - R_c

    # Calculate the variance of the R_diff matrix
    V_Rdiff = np.var(R_diff, ddof=1)

    # Calculate the expected value of V_Rdiff under the null hypothesis that the missing data is MCAR
    E_Rdiff = (1 - p_c) / (1 - p_m).sum()

    # Calculate the test statistic
    T = np.trace(R_diff) / np.sqrt(V_Rdiff * E_Rdiff)

    # Calculate the degrees of freedom
    df = data.shape[1] * (data.shape[1] - 1) / 2
    # Calculate the p-value using a chi-squared distribution with df degrees of freedom and the test statistic T
    p_value = 1 - scp.stats.chi2.cdf(T ** 2, df)

    return p_value


def compute_outliers(df: pd.DataFrame, method: OutlierMethod) -> Dict[str, Dict[str, Any]]:
    outliers_summary = {}
    for col in df.columns:
        data = df[col]
        if not np.issubdtype(df[col].dtype, np.number):
            continue
        lower = 0
        upper = 1
        if method == OutlierMethod.IQRMethod:
            q1 = data.quantile(0.25)
            q3 = data.quantile(0.75)
            iqr = q3 - q1
            lower = q1 - GLOBAL_SETTINGS.iqr_outlier_constant * iqr
            upper = q3 + GLOBAL_SETTINGS.iqr_outlier_constant * iqr
        elif method == OutlierMethod.ZMethod:
            lower = data.mean() - 3.0 * data.std()
            upper = data.mean() + 3.0 * data.std()
        elif method == OutlierMethod.PercentileMethod:
            lower = data.quantile(0.1)
            upper = data.quantile(0.9)

        outliers: pd.DataFrame = data[(data < lower) | (data > upper)]

        outliers_summary[col] = {
            'method': method,
            'lower': lower,
            'upper': upper,
            'count': len(outliers),
            'percent': len(outliers) * 100.0 / len(data),
            'rows': outliers.index
        }

    return outliers_summary


def compute_missingness(df: pd.DataFrame, variable_summary: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    missing_summary = {}
    for col in df.columns:
        if variable_summary[col]['missing_percent'] < 50.0 or variable_summary[col]['type'] == 'categorical':
            missing_summary[col] = {
                'missing': variable_summary[col]['missing'],
                'missing_percent': variable_summary[col]['missing_percent']
            }
        else:
            # determine whether MCAR or MAR
            mcar = little_mcar_test(df[col]) < GLOBAL_SETTINGS.global_alpha
            x = df.select_dtypes(include=[float, int])
            y = df[col].isnull().astype(int)
            sm_model = sm.Logit(y, sm.add_constant(x)).fit(disp=0)
            mar = any([p < GLOBAL_SETTINGS.global_alpha for p in sm_model.pvalues])
            missing_summary[col] = {
                'missing': variable_summary[col]['missing'],
                'missing_percent': variable_summary[col]['missing_percent'],
                'missing_type': 'mnar' if not mar and not mcar else 'mar' if mar else 'mcar'
            }

    return missing_summary


def generate_df_summary(df: pd.DataFrame) -> Dict[str, Any]:
    missing = df.isnull().sum().sum()
    ranges: list = []
    stds: list = []
    for col in df.columns:
        data = df[col]
        if np.issubdtype(df[col].dtype, np.number):
            ranges.append(data.max() - data.min())
            stds.append(data.std())

    median_locs = np.median(np.array(ranges))
    median_vars = np.median(np.array(stds))
    # compute if any of the columns have a range greater than 10 times the median range
    rscore = any([r > 10.0 * median_locs for r in ranges])
    # compute if any of the columns have a standard deviation greater than 3 times the median standard deviation
    vscore = any([s > 3.0 * median_vars for s in stds])

    summary = {
        'observations': len(df),
        'variables': len(df.columns),
        'missing': missing,
        'missing_percent': missing * 100.0 / (len(df) * len(df.columns)),
        'column_types': df.dtypes,
        'memory': df.memory_usage(deep=True).sum(),
        'num_numerical': len(df.select_dtypes(include=[float, int]).columns),
        'num_categorical': len(df.select_dtypes(include=[object]).columns),
        'range_median': median_locs,
        'variability_median': median_vars,
        'range_score': rscore,
        'variability_score': vscore
    }
    return summary


def generate_variable_summary(df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    summary = {}
    for col in df.columns:
        data = df[col]
        if not np.issubdtype(df[col].dtype, np.number):
            summary[col] = {
                'type': 'categorical',
                'unique': data.nunique(),
                'count' : data.count(),
                # count the number of null vals and number of occurrences of the character '-'
                'missing': data.isnull().sum() + data.apply(lambda x: 1 if x == '-' else 0).sum(),
                'missing_percent': data.isnull().sum() * 100.0 / len(data),
                'freq': data.value_counts().values[0],
            }
        else:
            outlier_summary = compute_outliers(df, GLOBAL_SETTINGS.outlier_detection_method)

            summary[col] = {
                'type': 'numerical',
                'missing': data.isnull().sum(),
                'missing_percent': data.isnull().sum() * 100.0 / len(data),
                'mean': data.mean(),
                'std': data.std(),
                'min': data.min(),
                'q1': data.quantile(0.25),
                'q2': data.quantile(0.5),
                'q3': data.quantile(0.75),
                'max': data.max(),
                'zeros': data[data == 0].count(),
                'negatives': data[data < 0].count(),
                'infinite': data[data == float('inf')].count(),
                'outlier_data': outlier_summary[col],
                'distinct': data.nunique(),
                'distinct_percent': data.nunique() * 100.0 / len(data),
                'skewness': scp.skew(data),
                'skewtest': scp.skewtest(data).statistic,
                'kurtosis': scp.kurtosis(data),
                'normality': scp.shapiro(data),
                'range': data.max() - data.min(),
                'count': data.count()
            }

    return summary


def analyze_dataset(df: pd.DataFrame) -> (Dict[str, Any], Dict[str, Dict[str, Any]], Dict[str, Dict[str, Any]]):
    summary = generate_df_summary(df)
    variable_summary = generate_variable_summary(df)
    missing_summary = compute_missingness(df, variable_summary)

    for col in variable_summary:
        variable_summary[col]['missing_report'] = generate_missing_value_report(variable_summary[col],
                                                                                missing_summary[col])
        if variable_summary[col]['type'] == 'numerical':
            skewness = variable_summary[col]['skewness']
            p_value = variable_summary[col]['skewtest']
            variable_summary[col]['skew_report'] = generate_skew_comment(variable_summary[col])
            variable_summary[col]['outlier_report'] = generate_outlier_report(
                variable_summary[col]['outlier_data']['count'], variable_summary[col]['count'])
        else:
            variable_summary[col]['cardinality_report'] = generate_unique_value_report(df[col])

    return summary, variable_summary, missing_summary


def generate_standardization_comment(data: pd.DataFrame) -> (list, str):
    rscore = data.max() - data.min() > 10.0 * data.mean()
    vscore = data.std() > 3.0 * data.quantile(0.5)
    issues = []
    fix = "None"
    if rscore:
        issues.append("Large data range detected.\nThis feature might dominate other features.")
    if vscore:
        issues.append("High variability detected.\nWill result in poor prediction performance.")
    if vscore or rscore:
        fix = "Standardization is recommended."

    return issues, fix


def generate_skew_comment(column_summary: Dict[str, Any]) -> DFOperation:
    abs_skew = abs(column_summary['skewness'])
    p_value = column_summary['skewtest']
    if abs_skew < 0.5:
        return DFOperation("Mild asymmetry.", "None", ['none'])
    elif 0.5 <= abs_skew < 1:
        if p_value < GLOBAL_SETTINGS.global_alpha:
            return DFOperation("Moderate skew (statistically significant).",
                               "Consider log/square root transformations.", ["transform", "log"])
        else:
            return DFOperation("Moderate skew (not significant).", "Transformation is optional.", ["transform", "root"])
    else:
        if p_value < GLOBAL_SETTINGS.global_alpha:
            return DFOperation("SEVERE SKEW!", "Apply log/Box-Cox transformations.",
                               ["transform", 'boxcox' if column_summary['min'] < 0 else 'log'])
        else:
            return DFOperation("High skew (not significant).", "Further investigate is required.",
                               ["transform", "box-cox"])


def generate_missing_value_report(column_report: Dict[str, Any], missing_report: Dict[str, Any]) -> DFOperation:
    percent = column_report['missing_percent']

    if column_report['type'] == 'numerical':
        outlier_strategy: str = 'mean' if column_report['outlier_data']['percent'] < 1.0 else 'median'


        if column_report['missing'] == 0:
            return DFOperation("No missing values.", "None", ['none'])
        elif percent < 5.0:
            return DFOperation("Minor missing values.", "Can be replaced with mean/median.",
                               ['impute', 'simple', outlier_strategy])
        elif percent < 20.0:
            return DFOperation("Moderate missing-ness.", "Can be replaced with mean/median. But exercise caution.",
                               ['impute', 'knn'])
        elif percent < 50.0:
            imputer_strategy: str = 'iterative' if missing_report['missing_type'] == 'mar' else 'simple'
            return DFOperation("High missing-ness.", "Use advanced imputation", ['impute', imputer_strategy])
        else:
            return DFOperation("Too many missing values", "Consider dropping the column.", ['drop'])
    else:
        return DFOperation("Missing values detected.",
                           f"Can be replaced with {GLOBAL_SETTINGS.category_impute_strategy}.",
                           ['impute', GLOBAL_SETTINGS.category_impute_strategy])


def generate_outlier_report(outlier_count, total_count) -> DFOperation:
    percent = float(outlier_count) * 100.0 / float(total_count)
    if outlier_count == 0:
        return DFOperation("No outliers", "None", ['none'])
    elif percent < 1.0:
        return DFOperation("Rare outliers. Likely harmless", "None", ['none'])
    elif percent < 5.0:
        return DFOperation("Some outliers are present.", "Consider using robust models if used to predict.",
                           ['scale', 'median'])
    else:
        return DFOperation("Excessive outliers.", "Investigate data quality or drop outliers.", ['drop'])


def generate_unique_value_report(col: pd.DataFrame) -> DFOperation:
    uc = col.nunique()
    if uc == 1 and col.count() != 1:
        return DFOperation("Zero variability in the column.", "Drop the column.", ['drop'])
    elif uc < 10:
        return DFOperation("Low cardinality.", "Use one-hot encoding.", ['encode', 'onehot'])
    elif uc < 50:
        return DFOperation("Moderate cardinality.", "Consider frequency encoding.", ['encode', 'frequency'])
    else:
        return DFOperation("High cardinality.", "Consider target encoding or embedding.",
                           ['encode', 'target' if uc < 1000 else 'embed'])

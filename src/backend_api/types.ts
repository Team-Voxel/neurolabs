
export interface TableRow {
    id: number;
    [key: string]: string | number;
}

export interface DataSummaryEntry {
  key: React.Key;
  name : string;
  type : string;
  missing_percent : string;
  central : string;
  dispersion : string;
  range : string;
  dist : Array<Record<string, string | number>>; // This can be a more complex type based on your distribution data
}

export interface DatasetSummary {
    featureSummaries : DataSummaryEntry[];
    problemType?: string;
    recommendations: string[];
    outliers: number[];
}

export interface DFStats {
  rowCount: number;
  columnCount: number;
  columns: string[];
  dtypes: string[];
  memoryUsage: string;
  missingValues: { [key: string]: number };
  sampleData: { [key: string]: number[] };
}

// Interface for the statistical properties of a continuous numeric column
export interface ContinuousDistribution {
  type: 'continuous';
  mean: number;
  std: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  q1: number;
  q2: number; // Median
  q3: number;
  outliers_lower: number; // Calculated using IQR
  outliers_upper: number; // Calculated using IQR
}

// Interface for the statistical properties of a discrete or non-numeric column
export interface DiscreteDistribution {
  type: 'discrete';
  unique_values: number;
  mode: string | number | boolean | null; // Mode can be various types
  mode_count: number;
  // value_counts in Python is a dict where keys are values and values are their normalized frequencies.
  // In TS, this translates to a record where keys are string representations of values and values are numbers.
  // We use `string` for keys because JS object keys are always strings, even if the original Python key was a number.
  value_counts: Record<string, number>;
}

// The main interface for the entire 'distributions' object
// It's a record where keys are column names (strings)
// and values can be either ContinuousDistribution or DiscreteDistribution.
export interface ColumnDistributions {
  [columnName: string]: ContinuousDistribution | DiscreteDistribution;
}

export interface DFRelationship {
  correlationPearson: {[column: string]: any};
  correlationSpearman: {[column: string]: any};
  highCorrelationFeatures: string[];
  interactions: string[];
  featureImportance: {[feature: string]: number};
}

export interface EDAData {
  statistics : DFStats;
  distributions: ColumnDistributions;
  relationships: DFRelationship;
};
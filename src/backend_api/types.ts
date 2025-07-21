
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
  dist : Array<Record<string, string | number>>;
}

export interface DatasetSummary {
    featureSummaries : DataSummaryEntry[];
    problemType?: string;
    issues: string[];
    outliers: number[];
}

export interface DFStats {
  row_count: number;
  column_count: number;
  columns: string[];
  dtypes: Record<string, string>; // Maps column names to their data types
  memory_usage: Record<string, number>;
  missing_values: { [key: string]: number };
  sample_data: Record<string, number>[]; // Maps column names to arrays of sample values
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

export interface FeatureImportanceData {
  feature: string;
  importance: number;
}

export interface DFRelationship {
  correlationPearson: number[][];
  correlationSpearman: number[][];
  highCorrelationFeatures: string[];
  interactions: string[];
  featureImportance: FeatureImportanceData[];
}

export interface ColumnSample {
  type: 'continuous' | 'discrete';
  values: number[];
}

export interface EDAData {
  statistics : DFStats;
  distributions: ColumnDistributions;
  relationships: DFRelationship;
  summary: DatasetSummary;
  reducedSample: Record<string, ColumnSample>
};

export interface SimpleDataset {
  X: number[][];
  y: number[];
}

export interface LearningCurveData {
  trainSizes: number[];
  trainScoresMean: number[];
  testScoresMean: number[];
}

export interface ModelTrainingInfo {

  // classification metrics
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  classes: string[];
  baseAccuracy: number;

  // classification metrics for probabilistic models
  rocX: number[];
  rocY: number[];
  prX: number[];
  prY: number[];
  rocAuc: number;
  averagePrecision: number;
  
  // decision boundary for classification models
  decisionBoundary: number[][];
  predictedClasses: number[];

  // model specific metrics
  trainedCoefficients: number[];
  trainedIntercept: number;
  trainedSupportVectors: number[][];

  // regression metrics
  r2: number;
  mse: number;
  rmse: number;
  mae: number;
  residuals: number[];
  yTest: number[];
  yPred: number[];

  // common metrics
  trainingTime: number; // in milli-seconds
  learningCurve: LearningCurveData;

  problemType: 'classify' | 'regress';
}

export interface UnsupervisedModelTrainingInfo {
  X: number[][];
  labels: number[];
  actualLabels: number[]; // Used for comparison with ground truth if available
  silhouette: number;
  CHI: number;
  explainedVariance: number | null;
}

export interface ModelSnapshot {
  hyperParameters: Record<string, any>;
  date: string;
  baseMetric: string; 
}

export interface ModelMetadata {
  modelType: string;
  path: string;
  config: string;
  lib: string;
  snapshots: ModelSnapshot[];
}

export interface ModelMetadataDict {
  [modelName: string]: ModelMetadata;
}

export interface DatasetNumerics {
  min: number;
  max: number;
}

export interface DatasetCategorics {
  values : string[];
}


export interface DatasetMetadata {
  rows: number;
  columns: string[];
  columnTypes: Record<string, 'cat' | 'num'>;
  numericalInfo: Record<string, DatasetNumerics>;
  categoricalInfo: Record<string, DatasetCategorics>;
  preprocessorPath: string;
  targetEncoderPath?: string;
}


export interface ModelPrediction {
  prediction: string;
  probas: Record<string, number>;
}
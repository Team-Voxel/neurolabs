
export interface TableRow {
    id: number;
    [key: string]: string | number;
}

export interface DataSummaryEntry {
  key: React.Key;
  name : string;
  type : string;
  missing_percent : number;
  central : number;
  dispersion : number;
  range : string;
}

export interface DatasetSummary {
    featureSummaries : DataSummaryEntry[];
    targetSummary : DataSummaryEntry;
    targetKDEx?: number[];
    targetKDEy?: number[];
    treeMapData?: {name : string, value : number}[];
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

export interface DFContDist{
  type: 'continuous';
  mean: number;
  std: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  q1: number;
  q2: number;
  q3: number;
  outliers_lower: number;
  outliers_upper: number;
}

export interface DFDiscreteDist {
  type: 'discrete';
  uniqueValues: number;
  mode: string;
  modeCount: number;
  valueCounts: { [column: string]: number };
}

export interface DFDistribution {
  type: 'continuous' | 'discrete';
  spec: {[column: string]: (DFContDist | DFDiscreteDist)};
};

export interface DFRelationship {
  correlationPearson: {[key: string]: any};
  correlationSpearman: {[key: string]: any};
  highCorrelationFeatures: string[];
  interactions: string[];
  featureImportance: {[key: string]: number};
}

export interface EDAData {
  statistics : DFStats;
  distributions: {[key : string]: (DFContDist | DFDiscreteDist)};
  relationships: DFRelationship;
};
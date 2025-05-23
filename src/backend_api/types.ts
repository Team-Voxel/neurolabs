
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

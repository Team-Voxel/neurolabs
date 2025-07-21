// types.ts

export interface TableColumn {
  field: string;
  headerName: string;
  flex?: number;
}
  
export interface TableRow {
  id: number;
  [key: string]: string | number;
}
  
export interface ScatterPoint {
  x: number;
  y: number;
  label: number;
}
  
export interface DatasetResponse {
  table: {
    columns: TableColumn[];
    rows: TableRow[];
  };
  scatter: ScatterPoint[];
}
  
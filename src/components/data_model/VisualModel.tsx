import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { fetchDataset, fetchUnpervisedModelOutput, requestAutoEDA } from "./api";
import { TableColumn, TableRow, ScatterPoint } from "./types";



// Show 2D and 3D dimensionality reduction visualizations for ( 3+ reg, 4+ class)
// Cases:
// Case 1: Problem - Regression, Features - 1 => Single Line Plot (X, y)
// Case 2: Problem - Regression, Features - 2 => Surface Plot (X1, X2, y)
// Case 3: Problem - Regression, Features - 3+ => DimRed2D and default to case 2 or DimRed1D and default to case 1
// Case 4: Problem - Classification, Features - 1 => XY Dot Plot (X, y (classes))
// Case 5: Problem - Classification, Features - 2 => 2D Scatter Plot (X1, X2, color by class)
// Case 6: Problem - Classification, Features - 3 => 3D Scatter Plot (X1, X2, X3, color by class)
// Case 7: Problem - Classification, Features - 4+ => DimRed3D and default to case 6 or DimRed2D and default to case 5

export interface VisualModelProps {
  problem : ('regress' | 'classify');
  features: number;
}

export const VisualModel: React.FC<VisualModelProps> = ({problem, features}) => {
  let cc = 1; // This should be determined based on the problem and features
  if (problem === 'regress' && features === 1) cc = 1;
  else if (problem === 'regress' && features === 2) cc = 2;
  else if (problem === 'regress' && features >= 3) cc = 3;
  else if (problem === 'classify' && features === 1) cc = 4;
  else if (problem === 'classify' && features === 2) cc = 5;
  else if (problem === 'classify' && features === 3) cc = 6;
  else if (problem === 'classify' && features >= 4) cc = 7;
  else cc = -1;

  return (
      
  );
};

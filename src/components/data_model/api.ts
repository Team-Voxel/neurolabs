// api.ts

import axios from "axios";
import { DatasetResponse } from "./types";

export async function fetchDataset(config: Record<string, any>): Promise<DatasetResponse> {
  const response = await axios.post<DatasetResponse>(
    "http://localhost:8000/generate",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function requestAutoEDA(config: Record<string, any>): Promise<any> {
  const response = await axios.post(
    "http://localhost:8000/auto-eda",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function fetchUnpervisedModelOutput(config: Record<string, any>): Promise<any> {
  const response = await axios.post(
    "http://localhost:8000/unsupervised",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}
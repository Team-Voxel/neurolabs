import axios from "axios";
import {DatasetSummary, EDAData} from "./types";
import { DatasetResponse } from "../components/data_model/types";



export async function generateDatasetPreview(config: Record<string, any>): Promise<DatasetSummary> {
    const response = await axios.post<DatasetSummary>(
        "http://127.0.0.1:8000/generate_dataset_preview",
        config,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
}

export async function generateSummaryFromFile(file_path : string, target_column : string, problem_type : string): Promise<DatasetSummary> {
    const response = await axios.post<DatasetSummary>(
        "http://127.0.0.1:8000/generate_summary_from_file",
        {file_path, target_column, problem_type},
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
}


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

export async function requestAutoEDA(config: Record<string, any>): Promise<boolean> {
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


export async function requestDimRedux(config: Record<string, any>): Promise<boolean> {
  const response = await axios.post(
    "http://localhost:8000/dim-redux",
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
    "http://localhost:8000/unsupervised-output",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}
import axios from "axios";
import {DatasetSummary, UnsupervisedModelTrainingInfo, ModelTrainingInfo, SimpleDataset, InferenceData} from "./types";
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

export async function getDatasetSimple(config: Record<string, any>): Promise<SimpleDataset> {
  const response = await axios.post(
    "http://localhost:8000/get-dataset-simple",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}


export async function trainModelSimple(config: Record<string, any>): Promise<ModelTrainingInfo> {
  const response = await axios.post(
    "http://localhost:8000/train-model-simple",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function trainUnsupervisedSimple(config: Record<string, any>): Promise<UnsupervisedModelTrainingInfo> {
  const response = await axios.post(
    "http://localhost:8000/simple-clustering",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}


export async function applyPreprocess(config: Record<string, any>): Promise<boolean> {
  const response = await axios.post(
    "http://localhost:8000/apply-preprocess",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function trainAndSaveModel(config: Record<string, any>): Promise<ModelTrainingInfo> {
  const response = await axios.post(
    "http://localhost:8000/create-train-save-model",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function makeInference(config: Record<string, any>): Promise<InferenceData> {
  const response = await axios.post(
    "http://localhost:8000/inference",
    config,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data['prediction'];
}
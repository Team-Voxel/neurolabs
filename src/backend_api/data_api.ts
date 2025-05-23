import axios from "axios";
import {DatasetSummary } from "./types";


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

export async function generateSummaryFromFile(file_path : string, target_column : string): Promise<DatasetSummary> {
    const response = await axios.post<DatasetSummary>(
        "http://127.0.0.1:8000/generate_summary_from_file",
        {file_path, target_column},
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
}
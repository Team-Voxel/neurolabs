// api.ts

import axios from "axios";
import { DatasetResponse } from "./types";

export async function fetchDataset(config: Record<string, any>): Promise<DatasetResponse> {
    const response = await axios.post<DatasetResponse>(
      "http://localhost:8000/generate",
      config,  // 👈 don't wrap in "params"
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }
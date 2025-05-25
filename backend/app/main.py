import json

from DGen import generate_classification
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import umap
from data_analysis import generate_file_summary_report
from data_generation import generate_and_save_data_return_stats

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FastAPI Server",
    description="A basic REST API/Web Sockets server using FastAPI",
    version="1.0.0"
)


origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateConfig(BaseModel):
    n_samples: int
    n_features: int
    random_state: int = 42  # optional default

@app.post("/generate")
async def generate(config: Dict):
    X, y = generate_classification(config)
    feature_names = [f"feature_{i}" for i in range(1, config['n_features'] + 1)]
    df = pd.DataFrame(X, columns=feature_names)
    df['target'] = y

    # --- For MUI DataGrid ---
    rows = df.reset_index().rename(columns={"index": "id"}).to_dict(orient="records")
    columns = [{"field": col, "headerName": col.replace("_", " ").title(), "flex": 1} for col in df.columns]


    if config['n_features'] > 2:
        reducer = umap.UMAP(n_components=2, random_state=42)
        embedding = reducer.fit_transform(X)
        scatter_data = [{"x": float(x), "y": float(y), "label": int(label)} for (x, y), label in zip(embedding, y)]
    else:
        scatter_data = [{"x": float(X[i][0]), "y": float(X[i][1]), "label": int(y[i])} for i in range(len(X))]
        
    return JSONResponse(content={
        "table": {
            "columns": columns,
            "rows": rows
        },
        "scatter": scatter_data
    })


@app.post("/generate_dataset_preview")
async def generate_dataset_preview(config: Dict):
    summary = generate_and_save_data_return_stats(config)
    if summary is None:
        raise HTTPException(status_code=404, detail="File not found or empty")
    return JSONResponse(content=summary)


class FilePathRequest(BaseModel):
    file_path: str
    target_column: str
    problem_type: str

@app.post("/generate_summary_from_file")
async def generate_summary_from_file(request : FilePathRequest):
    print(f'Req: {request.problem_type}, {request.target_column}')
    summary = generate_file_summary_report(request.file_path, request.target_column, request.problem_type)
    if summary is None:
        raise HTTPException(status_code=404, detail="File not found or empty")
    return JSONResponse(content=summary)


if __name__ == "__main__":
    import asyncio
    import uvicorn

    config = uvicorn.Config("main:app", host="127.0.0.1", port=8000, reload=True)
    server = uvicorn.Server(config)
    asyncio.run(server.serve())
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
from data_processing import *
from unsupervised import cluster_data

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
    "http://0.0.0.0:0"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#---------------------------------------Data Generation and Import---------------------------------------
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

#---------------------------------------Data Processing---------------------------------------
#---------------------------------------First Step: Preprocess---------------------------------------
@app.post("/apply-preprocess")
async def apply_preprocess(config: Dict):
    from data_processing import apply_preprocess_to_dataset
    success = apply_preprocess_to_dataset(config)
    return JSONResponse(content={'success': success})


#---------------------------------------Second Step: Dim Redux---------------------------------------
@app.post("/dim-redux")
async def dim_redux(config: Dict):
    success = compute_and_store_dim_redux(config)
    return JSONResponse(content={'success': success})


#---------------------------------------Third Step: Compute Stats---------------------------------------
@app.post("/auto-eda")
async def auto_eda(config: Dict):
    create_simplified_df_for_unsupervised_clustering(config)
    success = compute_and_save_dataset_stats(config)
    return JSONResponse(content={'success': success})



#----------------------------------------Model Training----------------------------------------
#----------------------------------------Unsupervised Output----------------------------------------
@app.post("/unsupervised-output")
async def unsupervised_output(config: Dict):
    return JSONResponse(content=config)


#----------------------------------------Create, Train and Save Model----------------------------------------
@app.post("/create-train-save-model")
async def create_train_save_model(config: Dict):
    from models import create_train_save_model
    data = create_train_save_model(config)
    return JSONResponse(content=data)

#----------------------------------------Inference API---------------------------------------------------
@app.post("/inference")
async def make_inference(config: Dict):
    from models import load_model_and_infer
    data = load_model_and_infer(config)
    return JSONResponse(content=data)


#========================================FOR SIMPLIFIED INTERFACE=========================================
#----------------------------------------Create and Save Dataset----------------------------------------
@app.post("/get-dataset-simple")
async def get_dataset_simple(config: Dict):
    from data_generation import generate_dataset
    data = generate_dataset(config.get('difficulty', 'medium'), config.get('wfDir', 'generated_data.csv'))
    return JSONResponse(content=data)


#----------------------------------------Train Model----------------------------------------
@app.post("/train-model-simple")
async def train_model_simple(config: Dict):
    from models import make_train_and_evaluate_model
    data = make_train_and_evaluate_model(config)
    return JSONResponse(content=data)

#----------------------------------------Unsupervised Clustering----------------------------------------
@app.post("/simple-clustering")
async def simple_clustering(config: Dict):
    """
    Clusters data using the specified clustering algorithm from the config.
    """
    try:
        data = cluster_data(config)
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import asyncio
    import uvicorn

    config = uvicorn.Config("main:app", host="127.0.0.1", port=8000, reload=True)
    server = uvicorn.Server(config)
    asyncio.run(server.serve())
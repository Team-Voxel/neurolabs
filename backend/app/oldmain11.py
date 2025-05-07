
from fastapi import FastAPI, HTTPException, WebSocket
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
import asyncio
import json
from .core.file_system import *
from .core.context import *
from .globals.global_data import global_context


app = FastAPI(
    title="FastAPI Server",
    description="A basic REST API/Web Sockets server using FastAPI",
    version="1.0.0"
)

class DataInput(BaseModel):
    values: List[float]
    operation: str  # Example: "sum", "average"


# REST API Endpoint
@app.post("/process-data")
async def process_data(data: DataInput) -> Dict:
    """Processes data and returns a result."""
    if data.operation == "sum":
        result = sum(data.values)
    elif data.operation == "average":
        result = sum(data.values) / len(data.values) if data.values else 0
    else:
        result = None
    
    return {"operation": data.operation, "result": result, "input": data.values}


@app.post("/get_headers")
async def get_headers(file_path : str) -> Dict[str, List[str]]:
    """
    Get headers from a CSV file.
    """
    try:
        headers = get_csv_headers(file_path)
        return {"headers": headers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/get_proj_list")
async def get_proj_list() -> List[str]:
    """
    Get all projects in the data directory.
    """
    try:
        projects = get_all_projects()
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/create_proj")
async def create_proj(project_init_block : str) -> Dict[str, str]:
    """
    Create a new project with the given name.
    """
    try:
        proj_name = project_init_block["name"]
        
        if proj_name in get_all_projects():
            raise ValueError(f"Project {proj_name} already exists.") # This should never occur. Checked by frontend.
        
        create_project_files(problem_name=proj_name, 
                              data_path=project_init_block["data_path"],
                              problem_type=project_init_block["problem_type"],
                              prediction_type=project_init_block["prediction_type"])
        return {"success": 1, "error": "none"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/proj_select")
async def proj_select(project_name : str) -> Dict[str, List[str]]:
    """
    Select a project with the given name if exists.
    """
    try:
        global global_context
        global_context = load_context(project_name)
        return {"success": 1, "error" : "none"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# WebSocket Endpoint for real-time data
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Simulates real-time data streaming."""
    await websocket.accept()
    try:
        while True:
            data = {"timestamp": asyncio.get_event_loop().time(), "value": random.random()}
            await websocket.send_json(data)
            await asyncio.sleep(1)  # Simulate periodic updates
    except Exception as e:
        print(f"WebSocket Error: {e}")


@app.post("/")
async def primary():
    return "Example"

# Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
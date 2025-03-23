
from fastapi import FastAPI, HTTPException, status
from datetime import datetime

app = FastAPI(
    title="FastAPI Server",
    description="A basic REST API server using FastAPI",
    version="1.0.0"
)


@app.get("/")
async def health_check():
    return {
        "timestamp": datetime.now().isoformat()
    }

# CRUD Operations
@app.post("/")
async def create_item():
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
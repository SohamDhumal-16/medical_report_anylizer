"""
FastAPI Main Application
Medical Report Analyzer Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import connect_to_mongo, close_mongo_connection
from routers import auth, upload, comparison, gemini_analysis

# Initialize FastAPI app
app = FastAPI(
    title="Medical Report Analyzer API",
    description="API for analyzing and comparing medical reports using AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        connect_to_mongo()
        print("Application started successfully")
    except Exception as e:
        print(f"Error during startup: {e}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    close_mongo_connection()
    print("Application shut down")


# Include routers
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(comparison.router)
app.include_router(gemini_analysis.router)  # FREE AI parsing!


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Medical Report Analyzer API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "auth": "/auth",
            "upload": "/upload",
            "gemini_analysis": "/gemini-analysis",
            "comparison": "/compare"
        }
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "API is running properly"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

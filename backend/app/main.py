from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MediFind API",
    description="Medicine Availability, Pharmacy Finder, and Pharmacist-Verified Alternatives Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MediFind FastAPI Service",
        "database": "SQLite/SQLAlchemy"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to MediFind Healthcare API. Visit /docs for interactive Swagger API schema."
    }

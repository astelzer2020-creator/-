from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import roi, analysis, geocode

app = FastAPI(title="Urban Renewal Israel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roi.router, prefix="/roi", tags=["ROI"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(geocode.router, prefix="/geocode", tags=["Geocode"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "urban-renewal-python"}

from pydantic import BaseModel, Field
from typing import Optional, List

class ROIInput(BaseModel):
    existingUnits: int = Field(ge=1)
    addedUnits: int = Field(ge=0)
    avgUnitSize: float = Field(ge=20, default=85)
    buildCost: float = Field(ge=1000, default=11000)
    salePrice: float = Field(ge=1000, default=25000)
    tenantCompensation: float = Field(ge=0, default=2500)
    financeRate: float = Field(ge=0, le=30, default=5)
    projectYears: int = Field(ge=1, le=20, default=4)
    landArea: float = Field(ge=0, default=1000)
    planType: str = 'תמ"א 38/2'

class ROIResult(BaseModel):
    revenue: float
    constructionCost: float
    tenantCost: float
    demolitionCost: float
    permits: float
    financeCost: float
    totalCost: float
    profit: float
    roi: float
    irr: float
    npv: float
    paybackYears: Optional[float]
    totalNewUnits: int
    breakeven_price_per_sqm: float

class BatchROIInput(BaseModel):
    projects: List[ROIInput]

class AnalysisInput(BaseModel):
    projects: List[dict]

class GeocodeInput(BaseModel):
    address: str
    city: Optional[str] = None

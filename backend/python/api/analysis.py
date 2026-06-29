from fastapi import APIRouter
from models.schemas import AnalysisInput
import statistics

router = APIRouter()


@router.post("/summary")
def summary(inp: AnalysisInput):
    projects = inp.projects
    if not projects:
        return {"error": "No projects provided"}

    rois = [float(p.get("roi", 0)) for p in projects if p.get("roi") is not None]
    investments = [float(p.get("investment", 0)) for p in projects if p.get("investment")]

    by_city = {}
    for p in projects:
        city = p.get("city", "אחר")
        by_city.setdefault(city, []).append(float(p.get("roi", 0)))

    city_stats = {
        city: {
            "count": len(rois_),
            "avgROI": round(statistics.mean(rois_), 2) if rois_ else 0,
        }
        for city, rois_ in by_city.items()
    }

    return {
        "totalProjects": len(projects),
        "avgROI": round(statistics.mean(rois), 2) if rois else 0,
        "medianROI": round(statistics.median(rois), 2) if rois else 0,
        "stdROI": round(statistics.stdev(rois), 2) if len(rois) > 1 else 0,
        "totalInvestment": sum(investments),
        "cityStats": city_stats,
        "topCity": max(city_stats, key=lambda c: city_stats[c]["avgROI"]) if city_stats else None,
    }


@router.post("/rank")
def rank(inp: AnalysisInput):
    """Rank projects by weighted score (ROI 50% + units density 30% + feasibility 20%)."""
    scored = []
    for p in inp.projects:
        roi = float(p.get("roi", 0))
        existing = float(p.get("existingUnits", 1) or 1)
        proposed = float(p.get("proposedUnits", 0) or 0)
        density_ratio = proposed / existing if existing else 0
        feasibility = 1.0 if p.get("status") in ["אושר", "הושלם"] else 0.6

        score = roi * 0.5 + density_ratio * 10 * 0.3 + feasibility * 100 * 0.2
        scored.append({**p, "score": round(score, 2), "densityRatio": round(density_ratio, 2)})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"ranked": scored}

from fastapi import APIRouter
import httpx
from models.schemas import GeocodeInput

router = APIRouter()

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

@router.post("/")
async def geocode(inp: GeocodeInput):
    query = f"{inp.address}, {inp.city}, Israel" if inp.city else f"{inp.address}, Israel"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(NOMINATIM_URL, params={
                "q": query, "format": "json", "limit": 3,
                "countrycodes": "il", "addressdetails": 1,
            }, headers={"User-Agent": "UrbanRenewalIL/1.0"})
            data = r.json()
            if data:
                return {
                    "lat": float(data[0]["lat"]),
                    "lng": float(data[0]["lon"]),
                    "display_name": data[0].get("display_name"),
                    "alternatives": [{"lat": float(d["lat"]), "lng": float(d["lon"]), "name": d.get("display_name")} for d in data[1:3]],
                }
    except Exception as e:
        pass
    return {"error": "Could not geocode address", "lat": 31.7683, "lng": 35.2137}


@router.get("/cities")
def cities():
    return {"cities": [
        {"name": "תל אביב", "lat": 32.0853, "lng": 34.7818},
        {"name": "ירושלים", "lat": 31.7683, "lng": 35.2137},
        {"name": "חיפה", "lat": 32.7940, "lng": 34.9896},
        {"name": "ראשון לציון", "lat": 31.9641, "lng": 34.8001},
        {"name": "פתח תקווה", "lat": 32.0873, "lng": 34.8867},
        {"name": "אשדוד", "lat": 31.8044, "lng": 34.6553},
        {"name": "נתניה", "lat": 32.3215, "lng": 34.8532},
        {"name": "באר שבע", "lat": 31.2518, "lng": 34.7913},
        {"name": "בני ברק", "lat": 32.0840, "lng": 34.8337},
        {"name": "רמת גן", "lat": 32.0700, "lng": 34.8240},
    ]}

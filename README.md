# סימולטור התחדשות עירונית ישראל

Full-stack web app for Israeli urban renewal simulation — React + Node.js + Python FastAPI.

## Features

- **יבוא נתוני תב"ע / PIO** — CSV, Excel (Hebrew encoding), GeoJSON
- **מחשבון ROI** — IRR, NPV, payback period, sensitivity analysis
- **תצוגה תלת-מימד** — Before/after 3D building comparison (Three.js / React Three Fiber)
- **מפת פרויקטים** — Leaflet map with project markers
- **דוחות** — Executive summary, cashflow, sensitivity charts

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TailwindCSS, Three.js, Recharts, Leaflet |
| Node API | Express 4, Multer, xlsx |
| Python API | FastAPI, Pydantic, Pandas, NumPy, SciPy |
| Deploy | Docker Compose |

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start all services concurrently
npm run dev
# → Frontend: http://localhost:3000
# → Node API: http://localhost:3001
# → Python API: http://localhost:8001

# Or use Docker
docker-compose up --build
```

## Python API

```bash
cd backend/python
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# Docs: http://localhost:8001/docs
```

## Data Import

Drop a file in the import page. Supported formats:
- **CSV** — Hebrew column names from taba system
- **Excel (.xlsx)** — Codepage 1255 (Windows Hebrew)
- **JSON / GeoJSON**

See `data/sample/sample-taba-projects.csv` for the expected column structure.

## Column Mapping (תב"ע → English)

| עברית | English field |
|-------|--------------|
| מספר תיק | caseNumber |
| כתובת | address |
| עיר | city |
| קומות קיים | existingFloors |
| יח"ד קיים | existingUnits |
| יח"ד מוצע | proposedUnits |
| עלות בנייה | buildCost |
| מחיר מכירה | salePrice |
| סוג תוכנית | planType |

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DataImport from './pages/DataImport'
import ROICalculator from './pages/ROICalculator'
import Visualization3D from './pages/Visualization3D'
import MapView from './pages/MapView'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="import" element={<DataImport />} />
          <Route path="roi" element={<ROICalculator />} />
          <Route path="3d" element={<Visualization3D />} />
          <Route path="map" element={<MapView />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

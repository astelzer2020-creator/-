import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Spinner from './components/ui/Spinner'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const DataImport = lazy(() => import('./pages/DataImport'))
const ROICalculator = lazy(() => import('./pages/ROICalculator'))
const Visualization3D = lazy(() => import('./pages/Visualization3D'))
const MapView = lazy(() => import('./pages/MapView'))
const Reports = lazy(() => import('./pages/Reports'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="projects" element={<ErrorBoundary><Projects /></ErrorBoundary>} />
              <Route path="projects/:id" element={<ErrorBoundary><ProjectDetail /></ErrorBoundary>} />
              <Route path="import" element={<ErrorBoundary><DataImport /></ErrorBoundary>} />
              <Route path="roi" element={<ErrorBoundary><ROICalculator /></ErrorBoundary>} />
              <Route path="3d" element={<ErrorBoundary><Visualization3D /></ErrorBoundary>} />
              <Route path="map" element={<ErrorBoundary><MapView /></ErrorBoundary>} />
              <Route path="reports" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
              <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import PageLoader from './components/common/PageLoader';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const SiteSurveysPage = lazy(() => import('./pages/SiteSurveysPage'));
const SurveyApprovalsPage = lazy(() => import('./pages/SurveyApprovalsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const MaterialsPage = lazy(() => import('./pages/MaterialsPage'));
const MaterialRequestsPage = lazy(() => import('./pages/MaterialRequestsPage'));
const EquipmentsPage = lazy(() => import('./pages/EquipmentsPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotifikasiPage = lazy(() => import('./pages/NotifikasiPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute permission="dashboard.view">
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="clients"
                element={
                  <ProtectedRoute permission="clients.view">
                    <ClientsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="site-surveys"
                element={
                  <ProtectedRoute permission="site-surveys.view">
                    <SiteSurveysPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="site-surveys/approvals"
                element={
                  <ProtectedRoute permission="site-surveys.approve">
                    <SurveyApprovalsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="projects"
                element={
                  <ProtectedRoute permission="projects.view">
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/:id"
                element={
                  <ProtectedRoute permission="projects.view">
                    <ProjectDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="proyek"
                element={
                  <ProtectedRoute permission="projects.view">
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="proyek/:id"
                element={
                  <ProtectedRoute permission="projects.view">
                    <ProjectDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="progress"
                element={
                  <ProtectedRoute permission="progress.view">
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="lapor-progres"
                element={
                  <ProtectedRoute permission="progress.view">
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="materials"
                element={
                  <ProtectedRoute permission="materials.view">
                    <MaterialsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="logistik"
                element={
                  <ProtectedRoute permission="materials.view">
                    <MaterialsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="material-requests"
                element={
                  <ProtectedRoute permission="material_requests.view">
                    <MaterialRequestsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="equipments"
                element={
                  <ProtectedRoute permission="equipments.view">
                    <EquipmentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="finance"
                element={
                  <ProtectedRoute permission="finance.view">
                    <FinancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="keuangan"
                element={
                  <ProtectedRoute permission="finance.view">
                    <FinancePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="documents"
                element={
                  <ProtectedRoute permission="documents.view">
                    <DocumentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="reports"
                element={
                  <ProtectedRoute permission="reports.view">
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="users"
                element={
                  <ProtectedRoute permission="users.view">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="settings"
                element={
                  <ProtectedRoute permission="settings.view">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="notifikasi"
                element={
                  <ProtectedRoute>
                    <NotifikasiPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

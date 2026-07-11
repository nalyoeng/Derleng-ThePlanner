import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import AdminLayout from '../features/admin/layout/AdminLayout'
import AdminDashboard from '../features/admin/AdminDashboard'
import PlaceManager from '../features/admin/PlaceManager'
import CreateAdmin from '../features/admin/CreateAdmin'
import {
  Backup,
  Recover,
} from '../features/admin/BackupRecover'
import Report from '../features/admin/Report'

const DESTINATION_ROLES = [
  'super_admin',
  'place_manager',
]

const REPORT_ROLES = [
  'super_admin',
  'moderator',
]

export default function AdminRoutes({ role, onLogout, }) {
  const canManageDestinations =
    DESTINATION_ROLES.includes(role)

  const canViewReports =
    REPORT_ROLES.includes(role)

  const isSuperAdmin =
    role === 'super_admin'

  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminLayout
            role={role}
            onLogout={onLogout}
          />
        }
      >
        <Route
          index
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        {canManageDestinations && (
          <Route
            path="destinations"
            element={<PlaceManager />}
          />
        )}

        {canViewReports && (
          <Route
            path="report"
            element={<Report />}
          />
        )}

        {isSuperAdmin && (
          <>
            <Route
              path="create-admin"
              element={<CreateAdmin />}
            />

            <Route
              path="backup"
              element={<Backup />}
            />

            <Route
              path="recover"
              element={<Recover />}
            />
          </>
        )}
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />
    </Routes>
  )
}
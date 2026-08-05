import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Overview from './pages/dashboard/Overview'
import Network from './pages/dashboard/Network'
import WalletPage from './pages/dashboard/WalletPage'
import Withdrawals from './pages/dashboard/Withdrawals'
import Kyc from './pages/dashboard/Kyc'
import UserProfileRouter from './pages/dashboard/UserProfilePages'
import AdminOverview from './pages/admin/AdminOverview'
import AdminMembers from './pages/admin/AdminMembers'
import AdminWithdrawals from './pages/admin/AdminWithdrawals'
import AdminKyc from './pages/admin/AdminKyc'
import AdminProducts from './pages/admin/AdminProducts'
import AdminModulePage from './pages/admin/AdminModulePage'
import AdminMemberAccount from './pages/admin/AdminMemberAccount'

function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireRole && role !== requireRole) return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

function AppRoutes() {
  const { isAuthenticated, role } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? (role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireRole="user">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="register-member" element={<UserProfileRouter />} />
        <Route path="profile/:type" element={<UserProfileRouter />} />
        <Route path="kyc/:type" element={<UserProfileRouter />} />
        <Route path="business/*" element={<UserProfileRouter />} />
        <Route path="license/:type" element={<UserProfileRouter />} />
        <Route path="payout/:type" element={<UserProfileRouter />} />
        <Route path="support/:type" element={<UserProfileRouter />} />
        <Route path="orders/:type" element={<UserProfileRouter />} />
        <Route path="continue-shopping" element={<UserProfileRouter />} />
        <Route path="network" element={<Network />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="kyc" element={<Kyc />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireRole="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="member-account/:memberId" element={<AdminMemberAccount />} />
        <Route path="pan-card/:status" element={<AdminModulePage />} />
        <Route path="company-business/:type" element={<AdminModulePage />} />
        <Route path="members/:type" element={<AdminModulePage />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="payout/:type" element={<AdminModulePage />} />
        <Route path="kyc" element={<AdminKyc />} />
        <Route path="change-password" element={<AdminModulePage />} />
        <Route path="pins/:type" element={<AdminModulePage />} />
        <Route path="rank-setting/:type" element={<AdminModulePage />} />
        <Route path="utility-desk/:type" element={<AdminModulePage />} />
        <Route path="products" element={<AdminProducts />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

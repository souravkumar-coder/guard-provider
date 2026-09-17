import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequireRole } from '@/components/routing/RequireRole';
import { Landing } from '@/pages/public/Landing';
import { GuardDirectory } from '@/pages/public/GuardDirectory';
import { GuardPublicProfile } from '@/pages/public/GuardPublicProfile';
import { Login } from '@/pages/public/Login';
import { Register } from '@/pages/public/Register';
import { NotFound } from '@/pages/public/NotFound';
import { CustomerDashboard } from '@/pages/customer/CustomerDashboard';
import { SearchGuards } from '@/pages/customer/SearchGuards';
import { MyRequests } from '@/pages/customer/MyRequests';
import { MyBookings } from '@/pages/customer/MyBookings';
import { CustomerProfile } from '@/pages/customer/CustomerProfile';
import { GuardDashboard } from '@/pages/guard/GuardDashboard';
import { GuardRequests } from '@/pages/guard/GuardRequests';
import { GuardBookings } from '@/pages/guard/GuardBookings';
import { GuardProfileEditor } from '@/pages/guard/GuardProfileEditor';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminRequests } from '@/pages/admin/AdminRequests';
import { AdminBookings } from '@/pages/admin/AdminBookings';
import { AdminReports } from '@/pages/admin/AdminReports';
import { NotificationsPage } from '@/pages/shared/NotificationsPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/guards" element={<GuardDirectory />} />
        <Route path="/guards/:id" element={<GuardPublicProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/notifications"
          element={
            <RequireRole>
              <NotificationsPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Customer dashboard */}
      <Route
        path="/dashboard"
        element={
          <RequireRole role="customer">
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="search" element={<SearchGuards />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Guard dashboard */}
      <Route
        path="/guard"
        element={
          <RequireRole role="guard">
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route index element={<GuardDashboard />} />
        <Route path="requests" element={<GuardRequests />} />
        <Route path="bookings" element={<GuardBookings />} />
        <Route path="profile" element={<GuardProfileEditor />} />
      </Route>

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
    </Routes>
  );
}

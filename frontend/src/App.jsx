import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ChooseRole from "./pages/auth/ChooseRole";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/ForgotPassword";

import ProtectedRoute from "./components/ProtectedRoute";

// ================= ADMIN =================
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Drivers from "./pages/admin/Drivers";
import Buses from "./pages/admin/Buses";
import AdminRoutes from "./pages/admin/Routes";
import AdminLiveTracking from "./pages/admin/LiveTracking";
import Schedules from "./pages/admin/Schedules";
import Analytics from "./pages/admin/Analytics";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/Profile";
import AdminNotifications from "./pages/admin/Notifications";

// ================= STUDENT =================
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard";
import MyBus from "./pages/student/MyBus";
import LiveTracking from "./pages/student/LiveTracking";
import Schedule from "./pages/student/Schedule";
import Notifications from "./pages/student/Notifications";
import Profile from "./pages/student/Profile";
import StudentSettings from "./pages/student/Settings";

// ================= DRIVER =================
import DriverLayout from "./layouts/DriverLayout";
import DriverDashboard from "./pages/driver/Dashboard";
import AssignedRoute from "./pages/driver/AssignedRoute";
import DriverStudents from "./pages/driver/Students";
import DriverLiveLocation from "./pages/driver/LiveLocation";
import DriverProfile from "./pages/driver/Profile";
import DriverSettings from "./pages/driver/Settings";
import DriverNotifications from "./pages/driver/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}

        <Route path="/" element={<ChooseRole />} />

        <Route
          path="/login/:role"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password/:role"
          element={<ForgotPassword />}
        />

        {/* ================= STUDENT ROUTES ================= */}

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={<StudentDashboard />}
          />

          <Route
            path="mybus"
            element={<MyBus />}
          />

          <Route
            path="tracking"
            element={<LiveTracking />}
          />

          <Route
            path="schedule"
            element={<Schedule />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="settings"
            element={<StudentSettings />}
          />
        </Route>

        {/* ================= DRIVER ROUTES ================= */}

        <Route
          path="/driver"
          element={
            <ProtectedRoute role="driver">
              <DriverLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={<DriverDashboard />}
          />

          <Route
            path="route"
            element={<AssignedRoute />}
          />

          <Route
            path="students"
            element={<DriverStudents />}
          />

          <Route
            path="live"
            element={<DriverLiveLocation />}
          />

          <Route
            path="notifications"
            element={<DriverNotifications />}
          />

          <Route
            path="profile"
            element={<DriverProfile />}
          />

          <Route
            path="settings"
            element={<DriverSettings />}
          />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="students"
            element={<Students />}
          />

          <Route
            path="drivers"
            element={<Drivers />}
          />

          <Route
            path="buses"
            element={<Buses />}
          />

          <Route
            path="routes"
            element={<AdminRoutes />}
          />

          <Route
            path="live-tracking"
            element={<AdminLiveTracking />}
          />

          <Route
            path="schedules"
            element={<Schedules />}
          />

          <Route
            path="analytics"
            element={<Analytics />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="notifications"
            element={<AdminNotifications />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />

          <Route
            path="profile"
            element={<AdminProfile />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
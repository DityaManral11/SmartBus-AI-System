import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChooseRole from "./pages/auth/ChooseRole";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import Buses from "./pages/admin/Buses";
import StudentLayout from "./layouts/StudentLayout";
import MyBus from "./pages/student/MyBus";
import LiveTracking from "./pages/student/LiveTracking";
import Schedule from "./pages/student/Schedule";
import Notifications from "./pages/student/Notifications";
import Profile from "./pages/student/Profile";
import StudentSettings from "./pages/student/Settings";
import DriverLayout from "./layouts/DriverLayout";
import DriverDashboard from "./pages/driver/Dashboard";
import AssignedRoute from "./pages/driver/AssignedRoute";
import DriverLiveLocation from "./pages/driver/LiveLocation";
import DriverProfile from "./pages/driver/Profile";
import DriverSettings from "./pages/driver/Settings";
import Drivers from "./pages/admin/Drivers";
import Students from "./pages/admin/Students";
import AdminRoutes from "./pages/admin/Routes";
import Schedules from "./pages/admin/Schedules";
import Analytics from "./pages/admin/Analytics";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import AdminLiveTracking from "./pages/admin/LiveTracking";
import ProtectedRoute from "./components/ProtectedRoute";
import DriverStudents from "./pages/driver/Students";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChooseRole />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >

          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="mybus" element={<MyBus />} />
          <Route path="tracking" element={<LiveTracking />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        <Route
          path="/driver"
          element={
            <ProtectedRoute role="driver">
              <DriverLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="route" element={<AssignedRoute />} />
          <Route path="students" element={<DriverStudents />} />
          <Route path="live" element={<DriverLiveLocation />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="settings" element={<DriverSettings />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="buses" element={<Buses />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="students" element={<Students />} />
          <Route path="routes" element={<AdminRoutes />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="live-tracking" element={<AdminLiveTracking />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
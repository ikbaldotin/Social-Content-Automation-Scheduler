import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import PostsPage from "./pages/PostsPage";
import CalendarPage from "./pages/CalendarPage";
import SocialAccountsPage from "./pages/SocialAccountsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TeamMembersPage from "./pages/TeamMembersPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/social-accounts" element={<SocialAccountsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/team-members" element={<TeamMembersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

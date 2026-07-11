import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SenderDashboard from './pages/dashboard/SenderDashboard';
import TravelerDashboard from './pages/dashboard/TravelerDashboard';
import AgentDashboard from './pages/dashboard/AgentDashboard';
import AdminPanel from './pages/admin/AdminPanel';
import AdminLogin from './pages/admin/AdminLogin';
import CreateShipment from './pages/CreateShipment';
import ParcelDetails from './pages/ParcelDetails';
import Tracking from './pages/Tracking';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLandingRoute = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAdminRoute && !isLandingRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/track" element={<Tracking />} />
        <Route path="/track/:code" element={<Tracking />} />

        {/* Admin routes — own layout, no Navbar */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/*" element={<AdminPanel />} />

        {/* A regular account is Sender + Traveler in one — both dashboards are shared */}
        <Route element={<ProtectedRoute allowedRoles={['SENDER', 'TRAVELER']} />}>
          <Route path="/dashboard/sender" element={<SenderDashboard />} />
          <Route path="/dashboard/traveler" element={<TravelerDashboard />} />
          <Route path="/shipment/create" element={<CreateShipment />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['AGENT']} />}>
          <Route path="/dashboard/agent" element={<AgentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['SENDER', 'TRAVELER', 'AGENT', 'ADMIN']} />}>
          <Route path="/parcel/:id" element={<ParcelDetails />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;

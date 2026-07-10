import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Bell,
  Settings,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  IndianRupee,
  Truck,
  ArrowRight,
  LogOut,
  Shield,
  Send,
  Eye,
  Ban,
  UserCheck,
  Clock,
  Activity,
  DollarSign,
  GitBranch,
} from 'lucide-react';
import axios from 'axios';

type Tab = 'dashboard' | 'users' | 'parcels' | 'assignments' | 'transactions' | 'notifications' | 'settings';

// Create admin-specific axios instance
const adminApi = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  // Check for admin token first, then fall back to regular token (for ADMIN role users)
  const token = localStorage.getItem('bhejdo_admin_token') || localStorage.getItem('bhejdo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bhejdo_admin_token');
      localStorage.removeItem('bhejdo_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface Stats {
  totalUsers: number;
  totalParcels: number;
  activeDeliveries: number;
  totalRevenue: number;
  totalPayouts: number;
  totalCommissions: number;
  platformEarnings: number;
  totalTrips: number;
  activeTrips: number;
  totalAssignments: number;
  deliveredAssignments: number;
  deliveryRate: number;
  usersByRole: { role: string; count: number }[];
  parcelsByStatus: { status: string; count: number }[];
  recentParcels: any[];
  topPickupCities: { city: string; count: number }[];
  topDestinationCities: { city: string; count: number }[];
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  verified: number | boolean;
  wallet_balance: number;
  created_at: string;
  address?: string;
}

interface ParcelRecord {
  id: string;
  tracking_code: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_city: string;
  pickup_city: string;
  destination_city: string;
  status: string;
  estimated_price: number;
  weight: number;
  created_at: string;
}

interface AssignmentRecord {
  id: string;
  tracking_code: string;
  pickup_city: string;
  destination_city: string;
  traveler_name: string;
  agent_name: string;
  destination_agent_name: string;
  status: string;
  created_at: string;
}

interface TransactionRecord {
  id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

interface NotificationRecord {
  id: string;
  user_name: string;
  user_email: string;
  type: string;
  title: string;
  message: string;
  read: number;
  created_at: string;
}

const NAV_ITEMS: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'parcels', label: 'Parcels', icon: Package },
  { key: 'assignments', label: 'Assignments', icon: GitBranch },
  { key: 'transactions', label: 'Transactions', icon: CreditCard },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Check admin auth on mount
  useEffect(() => {
    const token = localStorage.getItem('bhejdo_admin_token') || localStorage.getItem('bhejdo_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('bhejdo_admin_token');
    localStorage.removeItem('bhejdo_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">BhejDo</h1>
                <p className="text-[11px] text-slate-400 font-medium">Admin Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.key
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              {NAV_ITEMS.find((i) => i.key === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700">System Online</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'parcels' && <ParcelsTab />}
          {activeTab === 'assignments' && <AssignmentsTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}

/* ===================== DASHBOARD TAB ===================== */
function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.get('/admin/stats');
        const data = response.data.data;
        setStats({
          totalUsers: data.users?.total || 0,
          totalParcels: data.parcels?.total || 0,
          activeDeliveries: data.trips?.active || 0,
          totalRevenue: data.revenue?.total_collected || 0,
          totalPayouts: data.revenue?.total_payouts || 0,
          totalCommissions: data.revenue?.total_commissions || 0,
          platformEarnings: data.revenue?.platform_earnings || 0,
          totalTrips: data.trips?.total || 0,
          activeTrips: data.trips?.active || 0,
          totalAssignments: data.assignments?.total || 0,
          deliveredAssignments: data.assignments?.delivered || 0,
          deliveryRate: data.assignments?.delivery_rate || 0,
          usersByRole: data.users?.by_role || [],
          parcelsByStatus: data.parcels?.by_status || [],
          recentParcels: data.recent_parcels || [],
          topPickupCities: data.top_routes?.pickup_cities || [],
          topDestinationCities: data.top_routes?.destination_cities || [],
        });
      } catch {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString('en-IN')} icon={Users} color="blue" />
        <StatCard label="Total Parcels" value={stats.totalParcels.toLocaleString('en-IN')} icon={Package} color="emerald" />
        <StatCard label="Active Deliveries" value={stats.activeDeliveries.toLocaleString('en-IN')} icon={Truck} color="purple" />
        <StatCard label="Total Revenue" value={`Rs.${stats.totalRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="amber" />
        <StatCard label="Total Payouts" value={`Rs.${stats.totalPayouts.toLocaleString('en-IN')}`} icon={DollarSign} color="rose" />
      </div>

      {/* Revenue Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Revenue Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Total Collected</p>
            <p className="text-xl font-bold text-slate-800">Rs.{stats.totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Commissions</p>
            <p className="text-xl font-bold text-amber-600">Rs.{stats.totalCommissions.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Pending Payouts</p>
            <p className="text-xl font-bold text-orange-600">Rs.{stats.totalPayouts.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Net Revenue</p>
            <p className="text-xl font-bold text-green-600">Rs.{stats.platformEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parcels by Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            Parcels by Status
          </h3>
          <div className="space-y-3">
            {stats.parcelsByStatus.map((item) => {
              const total = stats.parcelsByStatus.reduce((sum, r) => sum + r.count, 0);
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              const colors: Record<string, string> = {
                CREATED: 'bg-slate-500',
                MATCHED: 'bg-blue-500',
                PICKED_UP: 'bg-indigo-500',
                IN_TRANSIT: 'bg-purple-500',
                REACHED: 'bg-amber-500',
                DELIVERED: 'bg-green-500',
                CANCELLED: 'bg-red-500',
              };
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-medium">{item.status.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-semibold text-slate-700">{item.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${colors[item.status] || 'bg-slate-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Users by Role
          </h3>
          <div className="space-y-3">
            {stats.usersByRole.map((item) => {
              const total = stats.usersByRole.reduce((sum, r) => sum + r.count, 0);
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              const colors: Record<string, string> = {
                SENDER: 'bg-blue-500',
                TRAVELER: 'bg-purple-500',
                AGENT: 'bg-amber-500',
                ADMIN: 'bg-slate-700',
              };
              return (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-medium">{item.role}</span>
                    <span className="text-xs font-semibold text-slate-700">{item.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${colors[item.role] || 'bg-slate-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{stats.deliveryRate}%</p>
              <p className="text-[10px] text-slate-500 font-medium">Delivery Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{stats.activeTrips}</p>
              <p className="text-[10px] text-slate-500 font-medium">Active Trips</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{stats.totalAssignments}</p>
              <p className="text-[10px] text-slate-500 font-medium">Assignments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Parcels */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentParcels.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No recent parcels</p>
            ) : (
              stats.recentParcels.map((parcel) => (
                <div key={parcel.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{parcel.sender_name}</p>
                      <p className="text-[10px] text-slate-500">{parcel.pickup_city} to {parcel.destination_city}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusBadgeColor(parcel.status)}`}>
                    {parcel.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-600" />
            Top Routes
          </h3>
          <div className="space-y-3">
            {stats.topPickupCities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No route data yet</p>
            ) : (
              stats.topPickupCities.map((pickup, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-700">{pickup.city}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">
                      {stats.topDestinationCities[idx]?.city || '-'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{pickup.count} parcels</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== USERS TAB ===================== */
function UsersTab() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (verifiedFilter !== 'ALL') params.verified = verifiedFilter === 'VERIFIED' ? 'true' : 'false';
      const response = await adminApi.get('/admin/users', { params });
      const data = response.data.data;
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, verifiedFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleVerify = async (userId: string) => {
    try {
      await adminApi.patch(`/admin/users/${userId}`, { verified: true });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verified: 1 } : u)));
    } catch {
      alert('Failed to verify user');
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm('Suspend this user? This cannot be easily undone.')) return;
    try {
      await adminApi.patch(`/admin/users/${userId}`, { role: 'BANNED' });
      fetchUsers();
    } catch {
      alert('Failed to suspend user');
    }
  };

  if (error && users.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Roles</option>
          <option value="SENDER">Sender</option>
          <option value="TRAVELER">Traveler</option>
          <option value="AGENT">Agent</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="VERIFIED">Verified</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Search
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">City</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Verified</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Balance</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Joined</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">{user.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{user.city || '-'}</td>
                      <td className="px-4 py-3">
                        {user.verified ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-300" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700 hidden lg:table-cell">
                        Rs.{(user.wallet_balance || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden xl:table-cell">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {!user.verified && (
                            <button
                              onClick={() => handleVerify(user.id)}
                              className="p-1.5 rounded-md hover:bg-green-50 text-slate-500 hover:text-green-600 transition-colors"
                              title="Verify"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                            title="Suspend"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No users found</p>
              </div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

/* ===================== PARCELS TAB ===================== */
function ParcelsTab() {
  const [parcels, setParcels] = useState<ParcelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchCode, setSearchCode] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = ['ALL', 'CREATED', 'MATCHED', 'PICKED_UP', 'IN_TRANSIT', 'REACHED', 'DELIVERED', 'CANCELLED'];

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const response = await adminApi.get('/admin/parcels', { params });
      const data = response.data.data;
      setParcels(data.parcels || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      setError('Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [page, statusFilter]);

  const filteredParcels = searchCode
    ? parcels.filter((p) => p.tracking_code?.toLowerCase().includes(searchCode.toLowerCase()))
    : parcels;

  if (error && parcels.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Search by tracking code..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tracking</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sender</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Receiver</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Price</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParcels.map((parcel) => (
                    <tr key={parcel.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-blue-600">
                        {parcel.tracking_code}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{parcel.sender_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">{parcel.receiver_name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600">
                          {parcel.pickup_city} <ArrowRight className="w-3 h-3 inline text-slate-400" /> {parcel.destination_city}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeColor(parcel.status)}`}>
                          {parcel.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700 hidden md:table-cell">
                        {parcel.estimated_price ? `Rs.${parcel.estimated_price.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                        {parcel.created_at ? new Date(parcel.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredParcels.length === 0 && (
              <div className="p-12 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No parcels found</p>
              </div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
}

/* ===================== ASSIGNMENTS TAB ===================== */
function AssignmentsTab() {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = ['ALL', 'PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'REACHED', 'DELIVERED'];

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const response = await adminApi.get('/admin/assignments', { params });
      const data = response.data.data;
      setAssignments(data.assignments || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [page, statusFilter]);

  if (error && assignments.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Parcel</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Traveler</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Pickup Agent</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Dest. Agent</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-blue-600">
                        {a.tracking_code || a.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600">
                          {a.pickup_city || '-'} <ArrowRight className="w-3 h-3 inline text-slate-400" /> {a.destination_city || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{a.traveler_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{a.agent_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{a.destination_agent_name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeColor(a.status)}`}>
                          {a.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {assignments.length === 0 && (
              <div className="p-12 text-center">
                <GitBranch className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No assignments found</p>
              </div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
}

/* ===================== TRANSACTIONS TAB ===================== */
function TransactionsTab() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ credits: 0, debits: 0, commissions: 0, payouts: 0 });

  const typeOptions = ['ALL', 'CREDIT', 'DEBIT', 'COMMISSION', 'PAYOUT', 'REWARD'];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (typeFilter !== 'ALL') params.type = typeFilter;
      const response = await adminApi.get('/admin/transactions', { params });
      const data = response.data.data;
      const txList: TransactionRecord[] = data.transactions || [];
      setTransactions(txList);
      setTotalPages(data.pagination?.pages || 1);

      // Calculate summary
      const credits = txList.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
      const debits = txList.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);
      const commissions = txList.filter((t) => t.type === 'COMMISSION').reduce((s, t) => s + t.amount, 0);
      const payouts = txList.filter((t) => t.type === 'PAYOUT').reduce((s, t) => s + t.amount, 0);
      setSummary({ credits, debits, commissions, payouts });
    } catch {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter]);

  if (error && transactions.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] text-slate-500 font-medium uppercase">Credits</p>
          <p className="text-lg font-bold text-green-600">+Rs.{summary.credits.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] text-slate-500 font-medium uppercase">Debits</p>
          <p className="text-lg font-bold text-red-600">-Rs.{summary.debits.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] text-slate-500 font-medium uppercase">Commissions</p>
          <p className="text-lg font-bold text-amber-600">Rs.{summary.commissions.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] text-slate-500 font-medium uppercase">Payouts</p>
          <p className="text-lg font-bold text-purple-600">Rs.{summary.payouts.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          {typeOptions.map((t) => (
            <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Balance After</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{tx.user_name}</p>
                          <p className="text-[10px] text-slate-400">{tx.user_role}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TransactionTypeBadge type={tx.type} />
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold ${
                        tx.type === 'CREDIT' || tx.type === 'REWARD' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'CREDIT' || tx.type === 'REWARD' ? '+' : '-'}Rs.{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">
                        Rs.{(tx.balance_after || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell max-w-[200px] truncate">
                        {tx.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length === 0 && (
              <div className="p-12 text-center">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No transactions found</p>
              </div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
}

/* ===================== NOTIFICATIONS TAB ===================== */
function NotificationsTab() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastRole, setBroadcastRole] = useState('SENDER');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      const response = await adminApi.get('/admin/notifications', { params });
      const data = response.data.data;
      setNotifications(data.notifications || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim()) {
      alert('Title is required');
      return;
    }
    setSending(true);
    try {
      const response = await adminApi.post('/admin/notifications/broadcast', {
        role: broadcastRole,
        title: broadcastTitle,
        message: broadcastMessage,
        type: 'BROADCAST',
      });
      alert(response.data.message || 'Broadcast sent!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      setShowBroadcast(false);
      fetchNotifications();
    } catch {
      alert('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  if (error && notifications.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      {/* Broadcast button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowBroadcast(!showBroadcast)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Send className="w-4 h-4" />
          Send Broadcast
        </button>
      </div>

      {/* Broadcast Form */}
      {showBroadcast && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Broadcast Notification</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <select
                value={broadcastRole}
                onChange={(e) => setBroadcastRole(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="SENDER">All Senders</option>
                <option value="TRAVELER">All Travelers</option>
                <option value="AGENT">All Agents</option>
              </select>
            </div>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="Notification title..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Notification message (optional)..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleBroadcast}
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                {sending && <Loader2 className="w-3 h-3 animate-spin" />}
                Send
              </button>
              <button
                onClick={() => setShowBroadcast(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Message</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Read</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-700">{n.user_name}</p>
                        <p className="text-[10px] text-slate-400">{n.user_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {n.type || 'SYSTEM'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{n.title}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell max-w-[200px] truncate">
                        {n.message || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {n.read ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-300" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {notifications.length === 0 && (
              <div className="p-12 text-center">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No notifications found</p>
              </div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
}

/* ===================== SETTINGS TAB ===================== */
function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* Platform Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-600" />
          Platform Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Traveler Commission</p>
            <p className="text-2xl font-bold text-slate-800">70%</p>
            <p className="text-[10px] text-slate-400 mt-1">Traveler gets 70% of parcel price</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Agent Commission</p>
            <p className="text-2xl font-bold text-slate-800">10%</p>
            <p className="text-[10px] text-slate-400 mt-1">Each agent gets 10% (pickup + dest)</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Platform Fee</p>
            <p className="text-2xl font-bold text-blue-600">20%</p>
            <p className="text-[10px] text-slate-400 mt-1">Platform retains 20% net revenue</p>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">System Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Platform Name</span>
            <span className="text-sm font-medium text-slate-800">BhejDo</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Version</span>
            <span className="text-sm font-medium text-slate-800">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">API Base URL</span>
            <span className="text-sm font-mono text-slate-800">http://localhost:3001/api</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Database</span>
            <span className="text-sm font-medium text-slate-800">SQLite (better-sqlite3)</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Admin Token Expiry</span>
            <span className="text-sm font-medium text-slate-800">24 hours</span>
          </div>
        </div>
      </div>

      {/* Fee Breakdown Visual */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Fee Distribution Model</h3>
        <div className="w-full h-8 rounded-full overflow-hidden flex">
          <div className="bg-purple-500 h-full flex items-center justify-center" style={{ width: '70%' }}>
            <span className="text-[10px] font-bold text-white">Traveler 70%</span>
          </div>
          <div className="bg-amber-500 h-full flex items-center justify-center" style={{ width: '10%' }}>
            <span className="text-[9px] font-bold text-white">10%</span>
          </div>
          <div className="bg-blue-600 h-full flex items-center justify-center" style={{ width: '20%' }}>
            <span className="text-[10px] font-bold text-white">Platform 20%</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-purple-500" />
            <span className="text-xs text-slate-600">Traveler</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-xs text-slate-600">Agents (5% each)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-600" />
            <span className="text-xs text-slate-600">Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== SHARED COMPONENTS ===================== */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-slate-500 uppercase">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    SENDER: 'bg-blue-50 text-blue-700 border-blue-200',
    TRAVELER: 'bg-purple-50 text-purple-700 border-purple-200',
    AGENT: 'bg-amber-50 text-amber-700 border-amber-200',
    ADMIN: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colors[role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {role}
    </span>
  );
}

function TransactionTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    CREDIT: 'bg-green-50 text-green-700 border-green-200',
    DEBIT: 'bg-red-50 text-red-700 border-red-200',
    COMMISSION: 'bg-amber-50 text-amber-700 border-amber-200',
    PAYOUT: 'bg-purple-50 text-purple-700 border-purple-200',
    REWARD: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colors[type] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {type}
    </span>
  );
}

function UserDetailModal({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">User Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-800">{user.name}</h4>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Role" value={user.role} />
            <InfoItem label="Phone" value={user.phone || '-'} />
            <InfoItem label="City" value={user.city || '-'} />
            <InfoItem label="Verified" value={user.verified ? 'Yes' : 'No'} />
            <InfoItem label="Balance" value={`Rs.${(user.wallet_balance || 0).toLocaleString('en-IN')}`} />
            <InfoItem label="Joined" value={user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-'} />
          </div>

          {user.address && (
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase mb-1">Address</p>
              <p className="text-sm text-slate-700">{user.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-slate-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    CREATED: 'bg-slate-100 text-slate-700',
    PENDING: 'bg-amber-50 text-amber-700',
    MATCHED: 'bg-blue-50 text-blue-700',
    ACCEPTED: 'bg-indigo-50 text-indigo-700',
    PICKED_UP: 'bg-indigo-50 text-indigo-700',
    IN_TRANSIT: 'bg-purple-50 text-purple-700',
    REACHED: 'bg-amber-50 text-amber-700',
    DELIVERED: 'bg-green-50 text-green-700',
    CANCELLED: 'bg-red-50 text-red-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-600';
}

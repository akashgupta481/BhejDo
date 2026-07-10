import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Wallet, ChevronDown, MessageCircle, LayoutDashboard, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BhejDoLogo } from './icons/BhejDoLogo';

function getDashboardRoute(role: string): string {
  switch (role) {
    case 'SENDER':
      return '/dashboard/sender';
    case 'TRAVELER':
      return '/dashboard/traveler';
    case 'AGENT':
      return '/dashboard/agent';
    case 'ADMIN':
      return '/admin';
    default:
      return '/dashboard';
  }
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/track') return location.pathname.startsWith('/track');
    if (path.startsWith('/dashboard') || path === '/admin') {
      return location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
    }
    return location.pathname === path;
  };

  const linkClass = (path: string) =>
    isActive(path)
      ? 'text-indigo-600 font-medium transition-colors'
      : 'text-slate-600 hover:text-indigo-600 font-medium transition-colors';

  const mobileLinkClass = (path: string) =>
    isActive(path)
      ? 'text-indigo-600 font-medium py-2 transition-colors'
      : 'text-slate-700 hover:text-indigo-600 font-medium py-2 transition-colors';

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated && user ? getDashboardRoute(user.role) : '/'} className="flex items-center gap-2 group">
            <BhejDoLogo className="h-8 w-8 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold gradient-text font-[family-name:var(--font-family-heading)]">BhejDo</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && user ? (
              <>
                {/* Dashboard */}
                <Link
                  to={getDashboardRoute(user.role)}
                  className={`flex items-center gap-1.5 ${linkClass(getDashboardRoute(user.role))}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {/* Track */}
                <Link
                  to="/track"
                  className={`flex items-center gap-1.5 ${linkClass('/track')}`}
                >
                  <MapPin className="h-4 w-4" />
                  Track
                </Link>

                {/* Wallet */}
                <Link
                  to="/wallet"
                  className={`flex items-center gap-1.5 ${linkClass('/wallet')}`}
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                  {user.wallet_balance > 0 && (
                    <span className="ml-0.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                      {user.wallet_balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className={`relative ${isActive('/notifications') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}
                >
                  <Bell className="h-5 w-5" />
                </Link>

                {/* Messages */}
                <Link
                  to="/messages"
                  className={`relative ${isActive('/messages') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">2</span>
                  </span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-sm">
                      {userInitial}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Guest: Home */}
                <Link to="/" className={linkClass('/')}>
                  Home
                </Link>

                {/* Guest: Track */}
                <Link to="/track" className={linkClass('/track')}>
                  Track
                </Link>

                {/* Guest: Sign Up (outlined) */}
                <Link
                  to="/signup"
                  className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-5 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>

                {/* Guest: Login (filled) */}
                <Link
                  to="/login"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-md shadow-indigo-200/50"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-700 hover:text-indigo-600 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated && user ? (
              <>
                {/* Dashboard */}
                <Link
                  to={getDashboardRoute(user.role)}
                  className={`flex items-center gap-3 ${mobileLinkClass(getDashboardRoute(user.role))}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {/* Track */}
                <Link
                  to="/track"
                  className={`flex items-center gap-3 ${mobileLinkClass('/track')}`}
                >
                  <MapPin className="h-4 w-4" />
                  Track
                </Link>

                {/* Wallet */}
                <Link
                  to="/wallet"
                  className={`flex items-center gap-3 ${mobileLinkClass('/wallet')}`}
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                  {user.wallet_balance > 0 && (
                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      {user.wallet_balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className={`flex items-center gap-3 ${mobileLinkClass('/notifications')}`}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>

                {/* Messages */}
                <Link
                  to="/messages"
                  className={`flex items-center gap-3 ${mobileLinkClass('/messages')}`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Messages
                  <span className="ml-auto w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                </Link>

                {/* Divider + Profile section */}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-base">
                      {userInitial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-3 ${mobileLinkClass('/profile')}`}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-600 hover:text-red-700 font-medium py-2 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Guest mobile menu */}
                <Link to="/" className={`block ${mobileLinkClass('/')}`}>
                  Home
                </Link>
                <Link to="/track" className={`block ${mobileLinkClass('/track')}`}>
                  Track
                </Link>

                <div className="border-t border-gray-100 pt-3 mt-3 flex flex-col gap-2">
                  <Link
                    to="/signup"
                    className="block text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

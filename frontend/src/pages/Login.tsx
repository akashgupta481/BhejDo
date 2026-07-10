import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BhejDoLogo } from '../components/icons/BhejDoLogo';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email or phone number is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const loggedInUser = await auth.login(email, password);

      if (rememberMe) {
        localStorage.setItem('bhejdo_remember', email);
      } else {
        localStorage.removeItem('bhejdo_remember');
      }

      // Redirect based on user role
      if (loggedInUser) {
        switch (loggedInUser.role) {
          case 'SENDER':
            navigate('/dashboard/sender');
            break;
          case 'TRAVELER':
            navigate('/dashboard/traveler');
            break;
          case 'AGENT':
            navigate('/dashboard/agent');
            break;
          case 'ADMIN':
            navigate('/admin');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Invalid credentials. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden hero-gradient">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative flex flex-col items-center justify-center w-full px-12">
          <div className="animate-float mb-8">
            <BhejDoLogo className="w-20 h-20" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 text-center font-[family-name:var(--font-family-heading)]">
            Welcome to BhejDo
          </h2>
          <p className="text-indigo-100 text-center text-lg max-w-md leading-relaxed">
            Send parcels with travelers going your way. Faster, cheaper, and community-driven logistics.
          </p>

          {/* Decorative elements */}
          <div className="mt-16 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-indigo-200 text-sm">Deliveries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5K+</p>
              <p className="text-indigo-200 text-sm">Travelers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-indigo-200 text-sm">Cities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
            {/* Mobile Logo */}
            <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
              <BhejDoLogo className="h-9 w-9" />
              <span className="text-2xl font-bold gradient-text font-[family-name:var(--font-family-heading)]">BhejDo</span>
            </div>

            {/* Heading */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-family-heading)]">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-4 animate-fade-in">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Phone Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email or Phone Number
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com or +91XXXXXXXXXX"
                  className="input-focus w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-focus w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 rounded-md"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <span
                  className="text-sm font-medium text-slate-400 cursor-not-allowed"
                  title="Coming soon"
                >
                  Forgot password?
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-press w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

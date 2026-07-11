import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BhejDoLogo } from '../components/icons/BhejDoLogo';
import { HappyCustomer, Parcel, Cloud } from '../components/illustrations/WarmArt';
import type { UserRole } from '../types';

type SignupRole = Exclude<UserRole, 'ADMIN'>;

interface FormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score === 3) return { score, label: 'Good', color: 'bg-emerald-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

export default function Signup() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [role, setRole] = useState<SignupRole>('SENDER');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles: { value: SignupRole; label: string; desc: string }[] = [
    { value: 'SENDER', label: 'Sender', desc: 'Send parcels' },
    { value: 'TRAVELER', label: 'Traveler', desc: 'Earn money' },
    { value: 'AGENT', label: 'Agent', desc: 'Handle pickups' },
  ];

  const passwordStrength = getPasswordStrength(formData.password);

  const passwordChecks = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One number', met: /[0-9]/.test(formData.password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await auth.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        city: formData.city,
        address: formData.address,
      });

      switch (role) {
        case 'SENDER':
          navigate('/dashboard/sender');
          break;
        case 'TRAVELER':
          navigate('/dashboard/traveler');
          break;
        case 'AGENT':
          navigate('/dashboard/agent');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Signup failed. Please try again.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex warm-canvas">
      {/* Left Panel - Brand illustration */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 warm-dots opacity-30"></div>
        <Cloud className="cloud-drift absolute top-16 right-12 w-24 opacity-90" />
        <Cloud className="cloud-drift d-2 absolute top-36 left-10 w-16 opacity-80" />
        <div className="relative flex flex-col items-center justify-center w-full px-12 text-center">
          <div className="flex items-center gap-2 mb-6">
            <BhejDoLogo className="w-11 h-11" />
            <span className="text-3xl font-bold font-display text-white">BhejDo</span>
          </div>
          <div className="relative">
            <HappyCustomer className="w-52 drop-shadow-xl" />
            <div className="absolute top-2 -right-4 w-14 float-soft"><Parcel /></div>
          </div>
          <h2 className="text-3xl font-bold font-display text-white mt-6 mb-3 drop-shadow">
            Join the journey
          </h2>
          <p className="text-white/90 text-center text-lg max-w-sm leading-relaxed">
            Whether you're sending or travelling, become part of India's friendliest delivery network.
          </p>

          <div className="mt-10 space-y-3 w-full max-w-xs">
            {[
              ['Verified community', 'All users are ID-verified'],
              ['Save up to 60%', 'Cheaper than couriers'],
              ['Secure OTP handoffs', 'End-to-end verification'],
            ].map(([t, s]) => (
              <div key={t} className="flex items-center gap-3 warm-glass rounded-2xl p-3.5 text-left">
                <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-slate-800 text-sm font-semibold">{t}</p>
                  <p className="text-slate-500 text-xs">{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in-up">
          <div className="soft-card p-6 sm:p-8">
            {/* Mobile Logo */}
            <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
              <BhejDoLogo className="h-9 w-9" />
              <span className="text-2xl font-bold gradient-text font-display">BhejDo</span>
            </div>

            {/* Heading */}
            <div className="text-center lg:text-left mb-6">
              <h1 className="text-3xl font-bold text-slate-900 font-display">Create your account</h1>
              <p className="mt-1 text-sm text-slate-500">Get started in under 2 minutes</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 mb-6">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`rounded-lg px-3 py-2.5 text-center transition-all ${
                    role === r.value
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span className="text-sm font-semibold block">{r.label}</span>
                  <span className={`text-xs ${role === r.value ? 'text-indigo-100' : 'text-slate-400'}`}>{r.desc}</span>
                </button>
              ))}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 animate-fade-in">
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="John Doe"
                  className={`input-focus w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                    errors.name ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                  }`}
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Email & Phone in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@example.com"
                    className={`input-focus w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      errors.email ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 9876543210"
                    className={`input-focus w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      errors.phone ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                    }`}
                  />
                  {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1.5">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Mumbai"
                  className={`input-focus w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                    errors.city ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                  }`}
                />
                {errors.city && <p className="mt-1.5 text-xs text-red-600">{errors.city}</p>}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter your full address"
                  rows={2}
                  className={`input-focus w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none ${
                    errors.address ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                  }`}
                />
                {errors.address && <p className="mt-1.5 text-xs text-red-600">{errors.address}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Create a strong password"
                    className={`input-focus w-full rounded-xl border px-4 py-3 pr-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      errors.password ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                    }`}
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
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">Password strength</span>
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength.score <= 1
                            ? 'text-red-600'
                            : passwordStrength.score === 2
                            ? 'text-yellow-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                      {passwordChecks.map((check) => (
                        <div key={check.label} className="flex items-center gap-1.5">
                          {check.met ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                              <X className="h-2.5 w-2.5 text-slate-300" />
                            </div>
                          )}
                          <span
                            className={`text-xs ${check.met ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                    className={`input-focus w-full rounded-xl border px-4 py-3 pr-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      errors.confirmPassword ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 rounded-md"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-terra w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

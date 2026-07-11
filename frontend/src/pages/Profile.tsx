import { useState } from 'react';
import { User, Mail, Phone, MapPin, Home, Shield, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    address: user?.address || '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await api.patch('/auth/profile', form);
      const updatedUser = response.data.data.user;
      updateUser(updatedUser);
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      address: user?.address || '',
    });
    setEditing(false);
    setError('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SENDER':
        return 'bg-indigo-100 text-indigo-700';
      case 'TRAVELER':
        return 'bg-emerald-100 text-emerald-700';
      case 'AGENT':
        return 'bg-orange-100 text-orange-700';
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) return null;

  return (
    <div className="warm-canvas min-h-screen">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 font-display">
        My Profile
      </h1>

      {error && (
        <div className="soft-card border-l-4 border-l-red-500 text-red-700 px-5 py-4 mb-6">{error}</div>
      )}
      {success && (
        <div className="soft-card border-l-4 border-l-emerald-500 text-emerald-700 px-5 py-4 mb-6">{success}</div>
      )}

      {/* Achievement badges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { tile: 'icon-tile-mustard', icon: Shield, label: 'Verified' },
          { tile: 'icon-tile-forest', icon: MapPin, label: 'Explorer' },
          { tile: 'icon-tile-terra', icon: User, label: 'Trusted' },
        ].map((b) => (
          <div key={b.label} className="soft-card p-4 flex flex-col items-center gap-2 text-center">
            <div className={`icon-tile ${b.tile} w-12 h-12 flex items-center justify-center`}><b.icon className="w-6 h-6" /></div>
            <span className="text-xs font-semibold text-slate-600">{b.label}</span>
          </div>
        ))}
      </div>

      <div className="soft-card overflow-hidden">
        {/* Header with avatar */}
        <div className="hero-gradient px-6 py-8 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute inset-0 warm-dots opacity-20" />
          <div className="relative w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center text-white text-2xl font-bold font-display">
            {getInitials(user.name)}
          </div>
          <div className="relative">
            <h2 className="text-xl font-bold text-white font-display">{user.name}</h2>
            <p className="text-white/85 text-sm">{user.email}</p>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Profile fields */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-slate-900 font-medium">{user.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              <p className="text-slate-900 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-slate-900 font-medium">{user.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
              {editing ? (
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-slate-900 font-medium">{user.city || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
              {editing ? (
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-slate-900 font-medium">{user.address || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          {editing ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-forest flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="btn-cream flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="btn-terra flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;

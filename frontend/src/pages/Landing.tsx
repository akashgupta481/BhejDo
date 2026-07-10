import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Users, MapPin, CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BhejDoLogo } from '../components/icons/BhejDoLogo';
import { HeroIllustration } from '../components/icons/HeroIllustration';
import { SendParcelIcon } from '../components/icons/SendParcelIcon';
import { TravelerIcon } from '../components/icons/TravelerIcon';
import { TrackingIcon } from '../components/icons/TrackingIcon';
import { SecureIcon } from '../components/icons/SecureIcon';
import { SpeedIcon } from '../components/icons/SpeedIcon';
import { WalletIcon } from '../components/icons/WalletIcon';

const Landing = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Redirect logged-in users to their role-based dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'SENDER':
          navigate('/dashboard/sender', { replace: true });
          break;
        case 'TRAVELER':
          navigate('/dashboard/traveler', { replace: true });
          break;
        case 'AGENT':
          navigate('/dashboard/agent', { replace: true });
          break;
        case 'ADMIN':
          navigate('/admin', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Determine smart navigation targets based on auth state and role
  const getSendParcelLink = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'SENDER') return '/shipment/create';
    if (user?.role === 'TRAVELER') return '/dashboard/traveler';
    return '/shipment/create';
  };

  const getBecomeTravelerLink = () => {
    if (!isAuthenticated) return '/signup?role=traveler';
    if (user?.role === 'TRAVELER') return '/dashboard/traveler';
    return '/dashboard/sender';
  };

  const steps = [
    { icon: Package, title: 'Create Shipment', desc: 'Tell us what you\'re sending and where it needs to go', num: 1 },
    { icon: Users, title: 'Match with Traveler', desc: 'We find a verified traveler heading to your destination', num: 2 },
    { icon: MapPin, title: 'Pickup & Handoff', desc: 'Our agent picks up your parcel and hands it to the traveler', num: 3 },
    { icon: CheckCircle, title: 'Delivered!', desc: 'Your parcel arrives safely with OTP verification', num: 4 },
  ];

  const features = [
    { svgIcon: WalletIcon, title: 'Cost Effective', desc: 'Save up to 60% compared to traditional courier services by leveraging travelers going your way', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { svgIcon: SecureIcon, title: 'Secure with OTP', desc: 'Every handoff is verified with one-time passwords. Your parcel is tracked at every step', color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-100' },
    { svgIcon: TrackingIcon, title: 'Real-time Tracking', desc: 'Know exactly where your parcel is at all times with live status updates', color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' },
    { svgIcon: SpeedIcon, title: 'Earn While Traveling', desc: 'Travelers earn money by carrying parcels on routes they\'re already taking', color: 'text-violet-600', bg: 'bg-violet-50', ring: 'ring-violet-100' },
  ];

  const stats = [
    { value: '10K+', label: 'Deliveries Made', color: 'text-indigo-600' },
    { value: '5K+', label: 'Active Travelers', color: 'text-orange-600' },
    { value: '50+', label: 'Cities Connected', color: 'text-emerald-600' },
    { value: '4.8', label: 'Average Rating', color: 'text-violet-600' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', city: 'Mumbai', text: 'BhejDo saved me so much money on sending documents to my family in Delhi. The traveler was super professional and delivery was faster than expected!', rating: 5 },
    { name: 'Rahul Verma', city: 'Bangalore', text: 'As a frequent traveler between cities, I earn extra income with almost no effort. Just carry a parcel that fits in my bag. Brilliant concept!', rating: 5 },
    { name: 'Anita Patel', city: 'Ahmedabad', text: 'The OTP verification at every step gave me complete peace of mind. I could track my parcel in real-time. Will definitely use again!', rating: 4 },
  ];

  const faqs = [
    { q: 'How does BhejDo work?', a: 'BhejDo is a peer-to-peer logistics platform that connects people who want to send parcels with travelers heading to the same destination. You create a shipment, we match you with a verified traveler, our agent handles the pickup, and your parcel gets delivered safely with OTP verification at every step.' },
    { q: 'Is my parcel insured?', a: 'Yes, we offer optional insurance coverage for all shipments. You can choose to add insurance during the shipment creation process. The premium is calculated based on the declared value of your parcel, and covers loss or damage during transit.' },
    { q: 'How do I become a traveler?', a: 'Simply sign up as a Traveler, verify your identity with a government-issued ID, and start accepting delivery jobs on routes you\'re already traveling. You set your own schedule and earn money for each successful delivery.' },
    { q: 'What items can I send?', a: 'You can send most non-prohibited items including documents, electronics, clothing, gifts, and personal items. Prohibited items include hazardous materials, illegal substances, weapons, and perishable goods without proper packaging. Check our full guidelines for details.' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative hero-gradient py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-orange-300/30 rounded-full animate-float animation-delay-200"></div>
          <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float animation-delay-400"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-badge-pulse"></span>
                <span className="text-white/90 text-sm font-medium">Trusted by 10,000+ users across India</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight font-[family-name:var(--font-family-heading)]">
                Send Parcels with{' '}
                <span className="relative">
                  Travelers
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 150 2 198 8" stroke="#F97316" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
                  </svg>
                </span>
                <br />Going Your Way
              </h1>
              <p className="text-lg sm:text-xl text-indigo-100 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                BhejDo connects senders with travelers heading to the same destination. Ship anything, anywhere — faster and cheaper than traditional logistics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to={getSendParcelLink()}
                  className="btn-press inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl shadow-lg hover:bg-indigo-50 hover:shadow-xl transition-all text-lg group"
                >
                  <Package className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Send a Parcel
                </Link>
                <Link
                  to={getBecomeTravelerLink()}
                  className="btn-press inline-flex items-center justify-center px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white transition-all text-lg"
                >
                  {isAuthenticated && user?.role === 'TRAVELER' ? 'Go to Dashboard' : 'Become a Traveler'}
                </Link>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="hidden lg:flex justify-center animate-fade-in animation-delay-300">
              <div className="animate-float">
                <HeroIllustration className="w-full max-w-md h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-8 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <p className={`text-3xl sm:text-4xl font-bold ${stat.color} font-[family-name:var(--font-family-heading)]`}>{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-family-heading)]">Simple, Fast & Reliable</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Get your parcel delivered in just 4 easy steps. No complexity, no hassle.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-indigo-200 via-orange-200 to-emerald-200"></div>

            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative text-center p-6 rounded-2xl bg-slate-50 hover:bg-white card-hover border border-transparent hover:border-indigo-100 group animate-fade-in-up"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="relative z-10 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-orange-500 text-white rounded-full text-lg font-bold mb-4 shadow-md group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 mx-auto block group-hover:bg-indigo-100 transition-colors">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 font-[family-name:var(--font-family-heading)]">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full mb-4">WHY BHEJDO</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-family-heading)]">Why Choose BhejDo?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">We're reimagining logistics to be more affordable, accessible, and community-driven</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 card-hover group animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.bg} ${feature.color} rounded-xl mb-5 ring-4 ${feature.ring} group-hover:scale-110 transition-transform`}>
                  <feature.svgIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 font-[family-name:var(--font-family-heading)]">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">TESTIMONIALS</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-family-heading)]">Loved by Our Community</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">See what our senders and travelers have to say about their BhejDo experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-8 rounded-2xl border border-slate-100 card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-white font-semibold text-sm">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-family-heading)]">
            Ready to Ship Smarter?
          </h2>
          <p className="text-indigo-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already saving money and time with BhejDo's peer-to-peer delivery network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={getSendParcelLink()}
              className="btn-press inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
            >
              <SendParcelIcon className="w-5 h-5 mr-2" />
              Send Your First Parcel
            </Link>
            <Link
              to={getBecomeTravelerLink()}
              className="btn-press inline-flex items-center justify-center px-8 py-4 bg-white/10 border-2 border-white/50 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-lg"
            >
              <TravelerIcon className="w-5 h-5 mr-2" />
              {isAuthenticated && user?.role === 'TRAVELER' ? 'Go to Dashboard' : 'Start Earning as Traveler'}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-family-heading)]">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-lg">Everything you need to know about BhejDo</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm card-hover">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-medium text-slate-900 pr-4">{faq.q}</span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${openFaq === idx ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'} flex items-center justify-center transition-colors`}>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BhejDoLogo className="w-9 h-9" />
                <span className="text-2xl font-bold text-white font-[family-name:var(--font-family-heading)]">BhejDo</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Peer-to-peer logistics that connects senders with travelers. Ship smarter, not harder.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-colors" aria-label="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-colors" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 font-[family-name:var(--font-family-heading)]">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 font-[family-name:var(--font-family-heading)]">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 font-[family-name:var(--font-family-heading)]">Get the App</h4>
              <p className="text-sm text-gray-400 mb-4">Coming soon on mobile</p>
              <div className="space-y-2">
                <div className="bg-slate-800 rounded-lg px-4 py-3 flex items-center gap-3 opacity-70">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <div>
                    <p className="text-xs text-gray-400">Download on the</p>
                    <p className="text-sm font-medium text-white">App Store</p>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg px-4 py-3 flex items-center gap-3 opacity-70">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg>
                  <div>
                    <p className="text-xs text-gray-400">Get it on</p>
                    <p className="text-sm font-medium text-white">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} BhejDo. All rights reserved.</p>
            <p>Made with care in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

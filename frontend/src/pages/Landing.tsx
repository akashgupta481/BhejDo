import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Users, MapPin, ShieldCheck, Zap, Wallet, Star, ChevronDown,
  ArrowRight, Sparkles, Menu, X, Truck as TruckIcon, Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BhejDoLogo } from '../components/icons/BhejDoLogo';
import { ScooterCourier, Parcel, Cloud, Pin, HappyCustomer } from '../components/illustrations/WarmArt';

/* reveal-on-scroll (reveals in-viewport items immediately, observes the rest) */
function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in-view')); return; }
    const revealVisible = () => {
      const vh = window.innerHeight || 800;
      els.forEach((el) => { if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in-view'); });
    };
    revealVisible();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold: 0.14 });
    els.forEach((el) => { if (!el.classList.contains('in-view')) io.observe(el); });
    return () => io.disconnect();
  }, []);
}

function CountUp({ to, suffix = '', decimals = 0, duration = 1500 }: { to: number; suffix?: string; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    const node = ref.current; if (!node) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setVal(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.6 });
    io.observe(node);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

function ripple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const c = document.createElement('span');
  const d = Math.max(el.clientWidth, el.clientHeight);
  const r = el.getBoundingClientRect();
  c.className = 'warm-ripple';
  c.style.width = c.style.height = `${d}px`;
  c.style.left = `${e.clientX - r.left - d / 2}px`;
  c.style.top = `${e.clientY - r.top - d / 2}px`;
  el.appendChild(c);
  setTimeout(() => c.remove(), 600);
}

/* Warm India route map */
type City = { name: string; x: number; y: number; parcels: string };
const CITIES: City[] = [
  { name: 'Delhi', x: 300, y: 150, parcels: '2,400+' },
  { name: 'Jaipur', x: 250, y: 205, parcels: '760+' },
  { name: 'Ahmedabad', x: 190, y: 275, parcels: '980+' },
  { name: 'Mumbai', x: 215, y: 335, parcels: '3,100+' },
  { name: 'Hyderabad', x: 320, y: 375, parcels: '1,600+' },
  { name: 'Bangalore', x: 290, y: 435, parcels: '2,050+' },
  { name: 'Chennai', x: 340, y: 470, parcels: '1,150+' },
  { name: 'Kolkata', x: 470, y: 300, parcels: '1,300+' },
];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [4, 7], [0, 7], [3, 5]];

function IndiaMap() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative">
      <svg viewBox="0 0 560 540" className="w-full h-auto">
        <defs>
          <linearGradient id="wlink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <radialGradient id="wglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(233,196,106,0.35)" /><stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="300" cy="300" rx="250" ry="240" fill="url(#wglow)" />
        {LINKS.map(([a, b], i) => {
          const A = CITIES[a], B = CITIES[b];
          const active = hover === a || hover === b;
          return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="url(#wlink)"
            strokeWidth={active ? 3 : 1.6} strokeOpacity={active ? 1 : 0.5} className="route-dash"
            style={{ transition: 'stroke-opacity .3s, stroke-width .3s' }} />;
        })}
        {CITIES.map((c, i) => {
          const active = hover === i;
          return (
            <g key={c.name} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <circle cx={c.x} cy={c.y} r={active ? 15 : 11} fill="rgba(124,58,237,0.18)" className="ring-pulse" />
              <circle cx={c.x} cy={c.y} r={active ? 8 : 6} fill={active ? '#F97316' : '#7C3AED'} style={{ transition: 'r .2s' }} />
              <text x={c.x} y={c.y - 16} textAnchor="middle" className="font-display" fontSize="14" fontWeight="600"
                fill={active ? '#6D28D9' : '#675A4E'} style={{ pointerEvents: 'none' }}>{c.name}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute top-2 right-2 soft-card px-5 py-4 w-48 transition-all duration-300" style={{ opacity: hover !== null ? 1 : 0.7 }}>
        <p className="text-xs uppercase tracking-wider text-slate-400">{hover !== null ? CITIES[hover].name : 'Live network'}</p>
        <p className="text-2xl font-bold font-display gradient-text mt-1">{hover !== null ? CITIES[hover].parcels : '14K+'}</p>
        <p className="text-xs text-slate-500">parcels delivered</p>
      </div>
    </div>
  );
}

const Landing = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  useScrollReveal();

  useEffect(() => {
    if (isAuthenticated && user) {
      const map: Record<string, string> = { SENDER: '/dashboard/sender', TRAVELER: '/dashboard/traveler', AGENT: '/dashboard/agent', ADMIN: '/admin' };
      navigate(map[user.role] ?? '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const hero = heroRef.current; if (!hero) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        hero.querySelectorAll<HTMLElement>('.warm-parallax').forEach((el) => {
          const depth = parseFloat(el.dataset.depth || '0.15');
          el.style.transform = `translate3d(${cx * depth * -50}px, ${cy * depth * -50}px, 0)`;
        });
      });
    };
    const reset = () => hero.querySelectorAll<HTMLElement>('.warm-parallax').forEach((el) => { el.style.transform = ''; });
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', reset);
    return () => { hero.removeEventListener('mousemove', onMove); hero.removeEventListener('mouseleave', reset); cancelAnimationFrame(raf); };
  }, []);

  const sendLink = !isAuthenticated ? '/login' : '/shipment/create';
  // Every signed-in account can act as a traveler — switch straight to that dashboard.
  const travelerLink = !isAuthenticated ? '/signup' : '/dashboard/traveler';

  const steps = [
    { icon: Package, tile: 'icon-tile-terra', title: 'Book a pickup', desc: 'Tell us what you\'re sending and where it\'s going. Takes under a minute.' },
    { icon: Users, tile: 'icon-tile-forest', title: 'We find a traveler', desc: 'A verified traveler already heading your way is matched to your parcel.' },
    { icon: MapPin, tile: 'icon-tile-mustard', title: 'Pickup & handoff', desc: 'Our agent collects it — every handoff verified with a secure OTP.' },
    { icon: Heart, tile: 'icon-tile-olive', title: 'Delivered with a smile', desc: 'Tracked live, delivered safely, confirmed with an OTP at the door.' },
  ];
  const features = [
    { icon: Wallet, tile: 'icon-tile-forest', title: 'Up to 60% cheaper', desc: 'Ride on journeys people already make — no courier overhead.' },
    { icon: ShieldCheck, tile: 'icon-tile-terra', title: 'OTP-secured handoffs', desc: 'Every transfer verified with one-time passwords and ID checks.' },
    { icon: MapPin, tile: 'icon-tile-mustard', title: 'Live tracking', desc: 'Follow your parcel down the route in real time, every step.' },
    { icon: Zap, tile: 'icon-tile-olive', title: 'Earn while you travel', desc: 'Travelers monetise routes they already take. Effortless income.' },
  ];
  const stats = [
    { value: 14, suffix: 'K+', label: 'Happy deliveries' },
    { value: 5, suffix: 'K+', label: 'Active travelers' },
    { value: 50, suffix: '+', label: 'Cities connected' },
    { value: 4.8, suffix: '', decimals: 1, label: 'Average rating' },
  ];
  const companies = ['Flipkart', 'Zomato', 'Swiggy', 'Nykaa', 'Meesho', 'Ola', 'PhonePe', 'Razorpay'];
  const testimonials = [
    { name: 'Priya Sharma', city: 'Mumbai', text: 'Sent documents to Delhi for a fraction of courier cost. The traveler was lovely and it arrived faster than expected!', rating: 5 },
    { name: 'Rahul Verma', city: 'Bangalore', text: 'I travel weekly and now earn extra carrying a parcel that fits in my bag. Genuinely brilliant.', rating: 5 },
    { name: 'Anita Patel', city: 'Ahmedabad', text: 'OTP at every step gave me total peace of mind, and I tracked everything live. Will use again!', rating: 5 },
  ];
  const faqs = [
    { q: 'How does BhejDo work?', a: 'We connect senders with travelers heading to the same destination. You book a pickup, we match you with a verified traveler, an agent handles the handoff, and your parcel is delivered with OTP verification at every step.' },
    { q: 'Is my parcel insured?', a: 'Yes. Optional insurance can be added while booking. The premium is based on declared value and covers loss or damage in transit.' },
    { q: 'How do I become a traveler?', a: 'Sign up as a Traveler, verify your identity with a government ID, and start accepting delivery jobs on routes you already travel. You set your own schedule.' },
    { q: 'What items can I send?', a: 'Most non-prohibited items: documents, electronics, clothing, gifts and personal items. Hazardous materials, illegal substances, weapons and unpackaged perishables are not allowed.' },
  ];
  const words = ['Send', 'anything,', 'anywhere', 'in', 'India.'];

  return (
    <div className="warm-canvas min-h-screen text-slate-800 overflow-x-hidden">
      {/* NAV */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav shadow-sm py-2.5' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <BhejDoLogo className="h-9 w-9 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold font-display text-slate-800">Bhej<span className="gradient-text">Do</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how" className="hover:text-primary-600 transition-colors">How it works</a>
            <a href="#network" className="hover:text-primary-600 transition-colors">Network</a>
            <a href="#features" className="hover:text-primary-600 transition-colors">Why BhejDo</a>
            <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">Login</Link>
            <Link to={sendLink} onClick={ripple} className="btn-terra text-sm px-5 py-2.5 rounded-full font-semibold">Send a Parcel</Link>
          </div>
          <button className="md:hidden text-slate-700" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <div className="md:hidden mx-4 mt-3 warm-glass rounded-2xl p-4 flex flex-col gap-1 text-slate-700">
            <a href="#how" onClick={() => setMenuOpen(false)} className="py-2">How it works</a>
            <a href="#network" onClick={() => setMenuOpen(false)} className="py-2">Network</a>
            <a href="#features" onClick={() => setMenuOpen(false)} className="py-2">Why BhejDo</a>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="py-2">FAQ</a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 text-center btn-cream py-2.5 rounded-full font-semibold">Login</Link>
              <Link to={sendLink} className="flex-1 text-center btn-terra py-2.5 rounded-full font-semibold">Send</Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 px-5">
        <div className="warm-blob" style={{ width: 340, height: 340, top: 40, right: -40, background: '#F7C9A3' }} />
        <div className="warm-blob" style={{ width: 300, height: 300, bottom: -40, left: -60, background: '#DDD0FA' }} />
        <Cloud className="cloud-drift absolute top-28 left-[8%] w-28 opacity-80 hidden sm:block" />
        <Cloud className="cloud-drift d-2 absolute top-44 right-[14%] w-20 opacity-70 hidden sm:block" />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="warm-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> India's friendliest parcel network
            </div>
            <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] text-slate-900 mb-6">
              {words.map((w, i) => (
                <span key={i} className="warm-word mr-3" style={{ animationDelay: `${0.15 + i * 0.11}s` }}>
                  {i === 0 || i === 1 ? <span className="gradient-text">{w}</span> : w}
                </span>
              ))}
            </h1>
            <p className="text-lg text-slate-600 max-w-lg mb-8 leading-relaxed">
              Ship parcels through verified travelers already heading your way —
              faster, cheaper and friendlier than a courier.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={sendLink} onClick={ripple} className="btn-terra sweep px-7 py-4 rounded-full text-base font-semibold inline-flex items-center justify-center gap-2">
                <Package className="w-5 h-5" /> Send a Parcel
              </Link>
              <Link to={travelerLink} onClick={ripple} className="btn-cream px-7 py-4 rounded-full text-base font-semibold inline-flex items-center justify-center gap-2">
                <TruckIcon className="w-5 h-5" /> {isAuthenticated && user?.role === 'TRAVELER' ? 'Go to Dashboard' : 'Become a Traveler'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-9 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {['#7C3AED', '#F97316', '#E9C46A', '#F97316'].map((c) => <span key={c} className="w-8 h-8 rounded-full border-2 border-[#FFF8F2]" style={{ background: c }} />)}
              </div>
              <span>Loved by <span className="font-semibold text-slate-700">10,000+</span> senders & travelers</span>
            </div>
          </div>

          {/* Hero illustration scene */}
          <div className="relative">
            <div className="warm-parallax" data-depth="0.1">
              <ScooterCourier className="w-full max-w-lg mx-auto drop-shadow-xl" />
            </div>
            <div className="warm-parallax absolute -top-4 right-6 w-20 float-soft" data-depth="0.3"><Parcel /></div>
            <div className="warm-parallax absolute top-24 -left-2 w-14 float-soft2 d-2" data-depth="0.34"><Parcel face={false} /></div>
            <div className="warm-parallax absolute bottom-6 right-2 w-16" data-depth="0.26"><Pin /></div>
            <div className="warm-parallax absolute -bottom-2 left-8 soft-card px-3 py-2 flex items-center gap-2" data-depth="0.2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-badge-pulse" />
              <span className="text-xs font-semibold text-slate-700">Out for delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative px-5 -mt-2">
        <div className="max-w-5xl mx-auto soft-card p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 reveal">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-4xl sm:text-5xl font-bold gradient-text"><CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} /></p>
              <p className="text-sm text-slate-500 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-5 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 reveal">
            <span className="warm-pill inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4">HOW IT WORKS</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900">Delivery in <span className="gradient-text">four happy steps</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className={`soft-card p-7 reveal reveal-${i + 1}`}>
                <div className={`icon-tile ${s.tile} w-14 h-14 flex items-center justify-center mb-5`}><s.icon className="w-7 h-7" /></div>
                <div className="text-xs font-bold text-primary-400 mb-1">STEP {i + 1}</div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NETWORK MAP */}
      <section id="network" className="px-5 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <span className="warm-pill inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4">LIVE NETWORK</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-5">One warm grid<br />across <span className="gradient-text">India</span></h2>
            <p className="text-slate-600 max-w-md mb-7 leading-relaxed">Every major city is a live pickup point. Parcels hop along the fastest human routes, matched in real time. Hover a city to see it light up.</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[{ i: MapPin, t: '50+ cities online' }, { i: Zap, t: 'Same-day matches' }, { i: ShieldCheck, t: 'Verified travelers' }, { i: TruckIcon, t: 'Doorstep pickup' }].map((f, k) => (
                <div key={k} className="soft-card px-4 py-3 flex items-center gap-3">
                  <f.i className="w-5 h-5 text-primary-500" /><span className="text-sm text-slate-600">{f.t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal reveal-2"><IndiaMap /></div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-12 overflow-hidden">
        <p className="text-center text-xs tracking-[0.25em] text-slate-400 uppercase mb-7 reveal">Trusted by shoppers & sellers across</p>
        <div className="warm-marquee-track relative">
          <div className="warm-marquee gap-12 pr-12">
            {[...companies, ...companies].map((c, i) => (
              <span key={i} className="font-display text-2xl font-semibold text-slate-300 hover:text-primary-400 transition-colors whitespace-nowrap">{c}</span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24" style={{ background: 'linear-gradient(90deg,#FFF8F2,transparent)' }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24" style={{ background: 'linear-gradient(270deg,#FFF8F2,transparent)' }} />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-5 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 reveal">
            <span className="warm-pill inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4">WHY BHEJDO</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900">Built for <span className="gradient-text">trust & smiles</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`soft-card p-8 flex gap-5 reveal reveal-${(i % 2) + 1}`}>
                <div className={`icon-tile ${f.tile} shrink-0 w-14 h-14 flex items-center justify-center`}><f.icon className="w-7 h-7" /></div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-5 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 reveal">
            <span className="warm-pill inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4">LOVED ACROSS INDIA</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900">Real people, <span className="gradient-text">real journeys</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className={`soft-card p-8 reveal reveal-${i + 1}`}>
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                <p className="text-slate-600 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#7C3AED,#E9C46A)' }}>
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div><p className="text-sm font-semibold text-slate-800">{t.name}</p><p className="text-xs text-slate-400">{t.city}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20">
        <div className="max-w-5xl mx-auto rounded-[36px] p-10 md:p-16 text-center relative overflow-hidden reveal hero-gradient">
          <div className="absolute inset-0 warm-dots opacity-40" />
          <div className="relative flex flex-col items-center">
            <HappyCustomer className="w-32 mb-4 drop-shadow-lg" />
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow">Ready to ship with a smile?</h2>
            <p className="text-white/90 text-lg max-w-xl mx-auto mb-8">Join thousands moving parcels across India on the friendliest delivery network around.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={sendLink} onClick={ripple} className="btn-cream px-8 py-4 rounded-full font-semibold inline-flex items-center justify-center gap-2"><Package className="w-5 h-5" /> Send Your First Parcel</Link>
              <Link to={travelerLink} onClick={ripple} className="btn-forest px-8 py-4 rounded-full font-semibold inline-flex items-center justify-center gap-2"><TruckIcon className="w-5 h-5" /> Start Earning as Traveler</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 reveal">
            <span className="warm-pill inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-4">FAQ</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900">Questions, <span className="gradient-text">answered</span></h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="soft-card overflow-hidden reveal">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-6 text-left">
                  <span className="font-display font-medium text-slate-800">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden"><p className="px-6 pb-6 text-slate-500 leading-relaxed">{f.a}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-5 pt-16 pb-10 mt-6 border-t border-[#F0E1D4]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4"><BhejDoLogo className="w-9 h-9" /><span className="text-2xl font-bold font-display text-slate-800">Bhej<span className="gradient-text">Do</span></span></div>
            <p className="text-slate-500 max-w-sm leading-relaxed">India's friendly peer-to-peer parcel network. Ship anything, anywhere — powered by the people already going your way.</p>
          </div>
          <div>
            <h4 className="font-display text-slate-800 font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#how" className="hover:text-primary-600 transition-colors">How it works</a></li>
              <li><a href="#network" className="hover:text-primary-600 transition-colors">Network</a></li>
              <li><Link to="/track" className="hover:text-primary-600 transition-colors">Track a parcel</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-slate-800 font-semibold mb-4">Get started</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/signup" className="hover:text-primary-600 transition-colors">Create account</Link></li>
              <li><Link to="/login" className="hover:text-primary-600 transition-colors">Login</Link></li>
              <li><Link to="/signup?role=traveler" className="hover:text-primary-600 transition-colors">Become a traveler</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#F0E1D4] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} BhejDo. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Made with <Heart className="w-4 h-4 text-primary-500 fill-primary-500" /> in India</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

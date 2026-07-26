import { PublicLayout } from '@/components/layout/public-layout';
import { Link } from 'wouter';
import { ArrowRight, BarChart3, CheckCircle, Globe, Lock, Repeat, Settings, Users, Zap } from '@/lib/icons';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function FadeSection({ children, className = '', delay = 0, direction = 'up' }: { children: React.ReactNode; className?: string; delay?: number; direction?: 'up' | 'left' | 'right' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const initial = direction === 'left' ? { opacity: 0, x: -40 } : direction === 'right' ? { opacity: 0, x: 40 } : { opacity: 0, y: 36 };
  return (
    <motion.div ref={ref} initial={initial} animate={inView ? { opacity: 1, x: 0, y: 0 } : {}} transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const FEATURES = [
  { icon: Globe, title: 'Global Payments', desc: 'Send mass payouts to 150+ countries via API, CSV upload, or our dashboard. Same-day settlement in major markets.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Finance teams, treasurers, and approvers — each with granular permissions and multi-level authorization workflows.' },
  { icon: Repeat, title: 'Automated Liquidity', desc: 'Sweep idle cash into yield-bearing instruments automatically. Set rules, we handle the rest.' },
  { icon: BarChart3, title: 'Real-Time Reporting', desc: 'Full transaction visibility with live dashboards, custom exports, and ERP-ready data feeds.' },
  { icon: Settings, title: 'API-First Architecture', desc: 'Integrate directly with your ERP, payroll, or treasury system. REST API with webhooks and full documentation.' },
  { icon: Lock, title: 'Enterprise Security', desc: 'SOC 2 Type II certified. MFA, IP allowlisting, session management, and full audit trails on every action.' },
];

export default function BusinessBanking() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#02439A]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=90"
            alt="Corporate banking"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02439A] via-[#02439A]/90 to-transparent" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 py-28">
          <div className="max-w-3xl">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-white/50 text-xs font-mono uppercase tracking-widest">
              Corporate Treasury
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="mt-4 text-6xl md:text-7xl font-serif font-bold text-white leading-tight">
              Treasury infrastructure for ambitious enterprises.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-6 text-xl text-white/70 max-w-xl leading-relaxed">
              API-driven payments, automated liquidity, role-based access, and real-time reporting — at institutional scale.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-8 flex flex-wrap gap-4">
              <Link href="/register">
                <button className="bg-white text-[#02439A] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-xl inline-flex items-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all">
                  Talk to Sales
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <FadeSection className="max-w-2xl mb-16">
            <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Platform Capabilities</span>
            <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900">Everything your finance team needs.</h2>
          </FadeSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <FadeSection key={f.title} delay={i * 0.09}>
                <div className="group p-8 rounded-2xl border border-[#e8eef8] bg-white hover:border-[#02439A]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-[#02439A]/10 rounded-xl flex items-center justify-center text-[#02439A] mb-5 group-hover:bg-[#02439A] group-hover:text-white transition-all duration-300">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* API demo */}
      <section className="py-28 bg-[#f5f8ff] border-y border-[#e8eef8] overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <FadeSection direction="left">
              <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Developer-First</span>
              <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900 leading-tight">Payments as simple as an API call.</h2>
              <p className="mt-5 text-slate-600 leading-relaxed">
                Our REST API is fully documented, versioned, and production-tested by enterprises processing billions annually. Webhooks, idempotent requests, and sandbox environments included.
              </p>
              <div className="mt-6 space-y-3">
                {['Comprehensive REST API', 'Real-time webhooks', 'Full sandbox environment', 'OpenAPI 3.0 spec available'].map(item => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#02439A]" />
                    <span className="text-slate-700 font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </FadeSection>
            <FadeSection direction="right">
              <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl font-mono text-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-slate-500 text-xs ml-2">POST /api/transfers</span>
                </div>
                <pre className="text-slate-300 text-xs leading-relaxed overflow-x-auto">{`{
  "fromAccountId": 1042,
  "amount": 250000.00,
  "currency": "USD",
  "recipientName": "Apex Capital Ltd",
  "recipientBank": "Deutsche Bank AG",
  "swiftCode": "DEUTDEDB",
  "iban": "DE89370400440532013000",
  "country": "Germany",
  "description": "Q4 Settlement"
}`}</pre>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-green-400 text-xs">200 OK · 48ms</div>
                  <pre className="text-slate-300 text-xs mt-2">{`{ "status": "completed",
  "reference": "BT-20241219-0042" }`}</pre>
                </div>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* Image split */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <FadeSection direction="left">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=90"
                  alt="Corporate team"
                  className="rounded-2xl w-full h-[480px] object-cover shadow-2xl"
                />
                <div className="absolute -top-6 -left-6 bg-[#02439A] text-white rounded-2xl p-6 shadow-xl">
                  <Zap className="w-6 h-6 mb-2 opacity-70" />
                  <div className="text-2xl font-bold font-mono">48ms</div>
                  <div className="text-white/70 text-xs mt-1">Avg. API response</div>
                </div>
              </div>
            </FadeSection>
            <FadeSection direction="right">
              <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Scale Confidently</span>
              <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900 leading-tight">
                Built to handle your highest-volume days.
              </h2>
              <p className="mt-5 text-slate-600 leading-relaxed">
                Whether you're processing 10 payments or 10,000 per day, our infrastructure scales without friction. Multi-region active-active deployment means no single points of failure.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: '99.99%', sub: 'Platform uptime' },
                  { label: '$42B+', sub: 'Processed annually' },
                  { label: '150+', sub: 'Countries reached' },
                  { label: '0', sub: 'Security breaches' },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#f5f8ff] border border-[#e8eef8] rounded-xl p-4">
                    <div className="text-2xl font-mono font-bold text-[#02439A]">{stat.label}</div>
                    <div className="text-slate-500 text-xs mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-[#02439A] overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <FadeSection>
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Ready to modernize your treasury?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">Speak with our corporate banking team and get set up in 48 hours.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact">
                <button className="bg-white text-[#02439A] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-xl inline-flex items-center gap-2">
                  Talk to Sales <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/register">
                <button className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all">
                  Create Account
                </button>
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>
    </PublicLayout>
  );
}

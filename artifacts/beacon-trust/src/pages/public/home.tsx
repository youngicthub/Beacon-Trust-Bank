import { Link } from 'wouter';
import { ArrowRight, Shield, Globe, Lock, TrendingUp, ChevronRight, Star, CheckCircle, ArrowUpRight, Building2, Users, Zap } from '@/lib/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple } from '@fortawesome/free-brands-svg-icons';
import { faGooglePlay } from '@fortawesome/free-brands-svg-icons';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/public-layout';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as any } }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

const STATS = [
  { value: '$42B+', label: 'Assets Under Management' },
  { value: '150+', label: 'Countries Served' },
  { value: '99.99%', label: 'Platform Uptime' },
  { value: 'Tier 1', label: 'Institutional Security' },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Military-Grade Security',
    desc: 'AES-256 encryption, biometric authentication, real-time anomaly detection, and 24/7 SOC monitoring protect every asset and transaction.',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=85',
  },
  {
    icon: Globe,
    title: 'Global Wire Transfers',
    desc: 'Send funds to any bank in any country. SWIFT, SEPA, ACH — real-time settlement in 40+ currencies at institutional exchange rates.',
    img: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=85',
  },
  {
    icon: TrendingUp,
    title: 'Unified Wealth View',
    desc: 'Every account, investment, credit line, and asset — consolidated in a single, beautifully engineered terminal. Total clarity.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=85',
  },
];

const SERVICES = [
  {
    title: 'Private Client Banking',
    subtitle: 'For individuals & families',
    desc: 'Multi-currency global checking, yield reserves, premium metal cards, and a dedicated private banker available 24/7.',
    href: '/personal-banking',
    img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=85',
  },
  {
    title: 'Corporate Treasury',
    subtitle: 'For enterprises & institutions',
    desc: 'Mass payouts, role-based access, API-driven transfers, automated liquidity optimization, and real-time reporting.',
    href: '/business-banking',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=85',
  },
  {
    title: 'Bespoke Credit',
    subtitle: 'Asset-backed & structured lending',
    desc: 'Prime mortgages, asset-backed credit, corporate lines — structured around your balance sheet, not a generic score.',
    href: '/loans',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=85',
  },
];

const TESTIMONIALS = [
  {
    quote: "Beacon Trust transformed how we manage our global treasury. The platform is flawless and the team is exceptional.",
    author: "James Harrington",
    title: "CFO, Harrington Capital Partners",
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=85',
  },
  {
    quote: "The international wire capability alone is worth everything. We move funds to 30 countries seamlessly, same day.",
    author: "Sofia Marchetti",
    title: "Managing Director, Meridian Ventures",
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=85',
  },
  {
    quote: "I've banked with three private banks over 20 years. Beacon Trust is in a different class entirely.",
    author: "Richard Okafor",
    title: "Family Office Principal",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=85',
  },
];

export default function Home() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#02439A]">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=90"
            alt="Beacon Trust headquarters"
            className="w-full h-full object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02439A] via-[#02439A]/90 to-[#02439A]/60" />
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 py-24">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-8xl font-serif font-bold text-white leading-[1.05] tracking-tight"
            >
              Wealth managed<br />
              with <span className="italic text-white/80">precision</span><br />
              and intent.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 text-xl text-white/70 font-light leading-relaxed max-w-2xl"
            >
              Beacon Trust is the digital private bank for individuals and institutions who demand institutional-grade security, global reach, and uncompromising personal service.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="bg-white text-[#02439A] hover:bg-white/90 h-14 px-8 text-base font-semibold shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5">
                  Apply for Membership <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all">
                  Client Portal
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Hero image panel (right side, desktop) */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-0 h-full w-[42%] hidden xl:block"
        >
          <img
            src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&q=90"
            alt="Private banking"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02439A] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02439A]/60 to-transparent" />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section ref={statsRef} className="bg-white border-b border-[#e8eef8] py-14">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col space-y-1 pl-5 border-l-2 border-[#02439A]"
              >
                <span className="text-4xl font-mono font-bold text-[#02439A]">{stat.value}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTRO SPLIT ── */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Our Philosophy</span>
              <h2 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                Banking built around your ambitions.
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Most banks are built for volume. Beacon Trust is built for depth. Every feature, every product, every interaction is engineered to serve the most demanding clients in the world — and to exceed their expectations, every time.
              </p>
              <div className="mt-8 space-y-4">
                {['Dedicated private banker, always available', 'Institutional exchange rates on all FX', 'Zero-fee international wire transfers', 'AI-powered fraud detection, 24/7'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#02439A] flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-[#02439A] font-semibold hover:gap-3 transition-all duration-200">
                Our story <ArrowRight className="w-4 h-4" />
              </Link>
            </AnimatedSection>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=90"
                  alt="Professional banking"
                  className="w-full h-[520px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02439A]/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                  <div className="text-white font-semibold">Private Client Account</div>
                  <div className="text-white/80 text-sm mt-1 font-mono">Balance: $1,245,820.00 USD</div>
                  <div className="mt-2 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +2.4% this month
                  </div>
                </div>
              </div>
              {/* Floating accent card */}
              <div className="absolute -top-6 -right-6 bg-[#02439A] text-white rounded-xl p-5 shadow-xl w-44">
                <Globe className="w-6 h-6 mb-2 opacity-70" />
                <div className="text-2xl font-bold font-mono">150+</div>
                <div className="text-xs text-white/70 mt-1">Countries reached</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES (image cards) ── */}
      <section className="py-28 bg-[#f5f8ff]">
        <div className="container mx-auto px-4 md:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Core Capabilities</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-slate-900">Uncompromising standards.</h2>
            <p className="mt-4 text-lg text-slate-600">Every facet engineered for the world's most demanding clients.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#e8eef8] hover:border-[#02439A]/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02439A]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 p-2.5 rounded-xl">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <AnimatedSection className="max-w-2xl mb-16">
            <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Our Services</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
              Designed for your financial trajectory.
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((svc, i) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.13, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={svc.href} className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-[#e8eef8] hover:border-[#02439A]/30 transition-all duration-400 hover:-translate-y-1">
                  <div className="relative h-52 overflow-hidden">
                    <img src={svc.img} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02439A] via-[#02439A]/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-white/70 text-xs font-mono uppercase tracking-wider">{svc.subtitle}</div>
                      <div className="text-white font-bold text-xl mt-0.5">{svc.title}</div>
                    </div>
                  </div>
                  <div className="bg-white p-6">
                    <p className="text-slate-600 text-sm leading-relaxed">{svc.desc}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-[#02439A] font-semibold text-sm group-hover:gap-2.5 transition-all">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL-BLEED IMAGERY ── */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1920&q=90"
          alt="Global reach"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#02439A]/75" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-xs font-mono uppercase tracking-widest text-white/60 mb-4">Global Network</p>
              <h2 className="text-5xl md:text-6xl font-serif font-bold leading-tight">
                Your bank, everywhere<br />you do business.
              </h2>
              <p className="mt-6 text-xl text-white/70 max-w-xl mx-auto">
                Seamless transfers to any country. Real-time settlement. Dedicated support in every timezone.
              </p>
              <Link href="/register">
                <Button className="mt-8 bg-white text-[#02439A] hover:bg-white/90 h-12 px-8 font-semibold shadow-xl">
                  Open an Account <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Client Voices</span>
            <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900">Trusted by the world's most demanding clients.</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
                className="bg-[#f5f8ff] border border-[#e8eef8] rounded-2xl p-8 flex flex-col hover:shadow-lg hover:border-[#02439A]/20 transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-6">
                  {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-[#02439A] text-[#02439A]" />)}
                </div>
                <blockquote className="text-slate-700 leading-relaxed flex-1 italic">"{t.quote}"</blockquote>
                <div className="mt-6 flex items-center gap-3 pt-6 border-t border-[#e8eef8]">
                  <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{t.author}</div>
                    <div className="text-slate-500 text-xs">{t.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY STRIP ── */}
      <section className="py-20 bg-[#f5f8ff] border-y border-[#e8eef8]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=90"
                alt="Technology"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#02439A]/60 to-transparent" />
              <div className="absolute inset-0 flex items-end p-8">
                <div>
                  <div className="flex gap-3 mb-3">
                    {['99.99%', '< 50ms', 'SOC 2'].map(badge => (
                      <span key={badge} className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-mono px-3 py-1 rounded-full">{badge}</span>
                    ))}
                  </div>
                  <div className="text-white font-bold text-lg">Enterprise-grade infrastructure</div>
                </div>
              </div>
            </motion.div>

            <AnimatedSection>
              <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Platform</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                Built on infrastructure that never sleeps.
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Multi-region active-active architecture, sub-50ms global response times, and a zero-downtime deployment pipeline — so your banking never stops, no matter where you are.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: 'Real-time processing' },
                  { icon: Lock, label: 'End-to-end encryption' },
                  { icon: Building2, label: 'FDIC insured' },
                  { icon: Users, label: '24/7 concierge' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-white border border-[#e8eef8] rounded-xl p-4">
                    <Icon className="w-4 h-4 text-[#02439A] flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── PRICING / TIERS ── */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-[#02439A] font-semibold">Choose your tier</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-4">Membership designed around you.</h2>
            <p className="text-lg text-slate-600">Every tier includes zero-fee international transfers, dedicated support, and full portal access.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Essential', price: 'Free', desc: 'For everyday personal banking.', features: ['Multi-currency checking', 'Virtual & physical debit card', 'Instant P2P transfers', 'Standard support 24/7'], cta: 'Open Free Account', highlight: false },
              { name: 'Prime', price: '$29/mo', desc: 'Wealth building for professionals.', features: ['Everything in Essential', 'Metal debit card, no FX fees', 'High-yield savings (5.2% APY)', 'Priority concierge', 'Investment accounts'], cta: 'Start Prime', highlight: true },
              { name: 'Private', price: 'By invite', desc: 'Bespoke banking for families & institutions.', features: ['Everything in Prime', 'Dedicated private banker', 'Structured credit lines', 'Family office services', 'Tax & estate advisory'], cta: 'Request Invitation', highlight: false },
            ].map((tier, i) => (
              <AnimatedSection key={tier.name} className={`relative rounded-2xl border-2 p-8 flex flex-col ${tier.highlight ? 'border-[#02439A] bg-white shadow-xl md:-translate-y-4' : 'border-slate-200 bg-white'}`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#02439A] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">Most popular</div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">{tier.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{tier.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-[#02439A] shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className={`w-full ${tier.highlight ? 'bg-[#02439A] text-white hover:bg-[#02439A]/90' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>{tier.cta}</Button>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL REACH ── */}
      <section className="py-24 md:py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto px-4 md:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <span className="text-xs uppercase tracking-[0.25em] text-[#7fb0ff] font-semibold">Global reach</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mt-4 mb-6">Bank across borders,<br />settle in seconds.</h2>
              <p className="text-lg text-white/70 leading-relaxed mb-8">Send funds to 150+ countries in 40+ currencies. SWIFT, SEPA, ACH, and FX all under one roof — at institutional rates, with real-time visibility.</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { k: '150+', v: 'Countries served' },
                  { k: '40+', v: 'Currencies supported' },
                  { k: '<10s', v: 'Median settlement' },
                  { k: '0.35%', v: 'Avg. FX markup' },
                ].map(x => (
                  <div key={x.v} className="border-l-2 border-[#02439A] pl-4">
                    <div className="text-3xl font-serif font-bold text-white">{x.k}</div>
                    <div className="text-sm text-white/60 mt-1">{x.v}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
            <AnimatedSection className="relative">
              <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=85" alt="Global network" className="rounded-2xl shadow-2xl w-full aspect-[4/5] object-cover" />
              <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 rounded-xl p-5 shadow-2xl max-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-700">Live</span>
                </div>
                <p className="text-sm font-medium">USD → EUR wire settled in 4.2s</p>
                <p className="text-xs text-slate-500 mt-1">London → Frankfurt · $2.4M</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── MOBILE APP ── */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-[#f5f8fd] to-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <AnimatedSection>
              <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=85" alt="Beacon Trust mobile app" className="rounded-3xl shadow-2xl w-full aspect-square object-cover" />
            </AnimatedSection>
            <AnimatedSection>
              <span className="text-xs uppercase tracking-[0.25em] text-[#02439A] font-semibold">Beacon Trust mobile</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 mb-6">Your wealth, in your pocket.</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">Face ID sign-in, biometric transfer approvals, spend insights, and instant card controls. The full private-bank experience — anywhere.</p>
              <ul className="space-y-3 mb-8">
                {['Freeze / unfreeze cards instantly', 'Biometric transaction approval', 'AI-powered spend categorisation', 'Push alerts for every movement'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-700"><CheckCircle className="w-4 h-4 text-[#02439A]" /> {f}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <div className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-colors">
                  <FontAwesomeIcon icon={faApple} className="text-2xl w-6 h-6" />
                  <div className="text-left leading-tight"><div className="text-[10px] opacity-70">Download on the</div><div className="text-sm font-semibold">App Store</div></div>
                </div>
                <div className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-colors">
                  <FontAwesomeIcon icon={faGooglePlay} className="text-2xl w-5 h-5" />
                  <div className="text-left leading-tight"><div className="text-[10px] opacity-70">Get it on</div><div className="text-sm font-semibold">Google Play</div></div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <AnimatedSection className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-[#02439A] font-semibold">Common questions</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">Everything you need to know.</h2>
          </AnimatedSection>
          <div className="space-y-3">
            {[
              { q: 'How long does it take to open an account?', a: 'Most personal accounts are approved within 24 hours after identity verification. Private and business tiers may take up to 72 hours for underwriting.' },
              { q: 'Is my money insured?', a: 'Yes. Deposits are insured by the FDIC up to $250,000 per depositor. Institutional balances above that are protected via our tier-1 custody partners.' },
              { q: 'What are the fees on international transfers?', a: 'There are no fixed wire fees on Prime and Private tiers. FX is charged at mid-market plus a transparent 0.35% average markup.' },
              { q: 'Can I use Beacon Trust for my business?', a: 'Absolutely. Our Corporate Treasury product supports mass payouts, role-based access, API integrations, and multi-entity accounting.' },
              { q: 'How do I get human support?', a: 'Every client has 24/7 concierge access via the Support page in the portal. Private clients receive a named private banker with direct-line contact.' },
            ].map((item, i) => (
              <AnimatedSection key={i}>
                <details className="group border border-slate-200 rounded-xl bg-white hover:border-[#02439A]/40 transition-colors">
                  <summary className="cursor-pointer list-none p-5 flex justify-between items-center font-medium text-slate-900">
                    <span>{item.q}</span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 leading-relaxed">{item.a}</div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-32 bg-[#02439A] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover object-top opacity-10"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)]" />
        </div>
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Elevate your financial<br />infrastructure.
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Join the exclusive network of clients who trust Beacon Trust to secure, manage, and grow their wealth across 150+ countries.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-[#02439A] hover:bg-white/90 h-14 px-10 text-base font-semibold shadow-2xl hover:-translate-y-0.5 transition-all duration-200">
                  Begin Your Application <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-14 px-10 text-base border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all">
                  Speak with a Banker
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}

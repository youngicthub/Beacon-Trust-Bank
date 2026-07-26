import { PublicLayout } from '@/components/layout/public-layout';
import { Link } from 'wouter';
import { ArrowRight, CreditCard, Globe, Shield, TrendingUp, Lock, CheckCircle, Zap, Users } from '@/lib/icons';
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

const PRODUCTS = [
  {
    icon: Globe,
    title: 'Global Checking',
    desc: 'Hold, spend, and transfer in USD, EUR, GBP, and 40+ currencies from a single account. Institutional FX rates, always.',
    img: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=85',
    perks: ['Zero international transaction fees', 'Real-time FX conversion', 'Multi-currency statements'],
  },
  {
    icon: TrendingUp,
    title: 'Yield Reserve',
    desc: 'Your idle cash earns institutional money market returns, automatically. No minimums, no lock-ups.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=85',
    perks: ['4.85% APY on USD balances', 'Daily liquidity', 'FDIC-insured up to $5M'],
  },
  {
    icon: CreditCard,
    title: 'Beacon Obsidian Card',
    desc: 'A high-limit metal card with concierge, airport lounge access, and zero-liability fraud protection worldwide.',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=85',
    perks: ['No pre-set spending limit', '3x points on travel & dining', 'Priority Pass lounge access'],
  },
];

const INCLUDED = [
  'Dedicated private banker, 24/7',
  'Zero international wire fees',
  'Institutional FX rates',
  'Priority fraud response',
  'FDIC insured to $5M',
  'Free ATM worldwide',
  'Concierge service',
  'Family account linking',
];

export default function PersonalBanking() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-[#02439A]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1920&q=90"
            alt="Private banking"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02439A] via-[#02439A]/85 to-transparent" />
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 py-28">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-white/50 text-xs font-mono uppercase tracking-widest"
            >
              Private Client Banking
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-4 text-6xl md:text-7xl font-serif font-bold text-white leading-tight"
            >
              Banking for those who expect more.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 text-xl text-white/70 max-w-xl leading-relaxed"
            >
              Multi-currency accounts, yield-bearing reserves, and a dedicated private banker — all in one elegant platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex gap-4"
            >
              <Link href="/register">
                <button className="bg-white text-[#02439A] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-xl inline-flex items-center gap-2">
                  Open an Account <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all inline-flex items-center gap-2">
                  Speak with a Banker
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
        {/* Right panel image */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute right-0 top-0 h-full w-2/5 hidden lg:block"
        >
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=90"
            alt="Banking lifestyle"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02439A] to-transparent" />
        </motion.div>
      </section>

      {/* Products */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <FadeSection className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Products</span>
            <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900">Everything you need. Nothing you don't.</h2>
          </FadeSection>
          <div className="grid md:grid-cols-3 gap-8">
            {PRODUCTS.map((p, i) => (
              <FadeSection key={p.title} delay={i * 0.12}>
                <div className="group bg-white border border-[#e8eef8] rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#02439A]/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02439A]/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-2.5 rounded-xl inline-block">
                        <p.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 text-xl mb-2">{p.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-5">{p.desc}</p>
                    <div className="space-y-2">
                      {p.perks.map(perk => (
                        <div key={perk} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-[#02439A] flex-shrink-0" />
                          <span className="text-slate-700">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle image + what's included */}
      <section className="py-28 bg-[#f5f8ff] border-y border-[#e8eef8] overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <FadeSection direction="left">
              <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Always Included</span>
              <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900 leading-tight">No tiers. No upgrade fees. Just everything.</h2>
              <p className="mt-5 text-slate-600 leading-relaxed">Every Beacon Trust Private Client account comes with the full suite. There's no premium tier, because every client is premium.</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {INCLUDED.map(item => (
                  <div key={item} className="flex items-center gap-2.5 bg-white border border-[#e8eef8] rounded-xl p-3">
                    <CheckCircle className="w-4 h-4 text-[#02439A] flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register">
                <button className="mt-8 bg-[#02439A] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#02439A]/90 transition-all hover:-translate-y-0.5 shadow-lg inline-flex items-center gap-2">
                  Open Your Account <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </FadeSection>
            <FadeSection direction="right">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&q=90"
                  alt="Premium lifestyle"
                  className="rounded-2xl w-full h-[500px] object-cover shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-[#02439A] text-white rounded-2xl p-6 shadow-xl max-w-xs">
                  <Lock className="w-5 h-5 mb-2 opacity-70" />
                  <div className="font-bold">Zero-breach record</div>
                  <div className="text-white/70 text-sm mt-1">Since our founding in 1987</div>
                </div>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* Full bleed */}
      <section className="relative h-[50vh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1920&q=85" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#02439A]/80" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <FadeSection>
            <h2 className="text-5xl font-serif font-bold text-white mb-4">Your private banker. Always on.</h2>
            <p className="text-white/70 text-xl max-w-xl mx-auto mb-8">Reach a real person, any time of day, in any timezone. No bots. No queues.</p>
            <Link href="/contact">
              <button className="bg-white text-[#02439A] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-xl inline-flex items-center gap-2">
                Contact Us <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </FadeSection>
        </div>
      </section>
    </PublicLayout>
  );
}

import { PublicLayout } from '@/components/layout/public-layout';
import { Link } from 'wouter';
import { ArrowRight, Award, Globe, Shield, TrendingUp } from '@/lib/icons';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const TIMELINE = [
  { year: '1987', title: 'Founded in New York', desc: 'Beacon Trust opens its first private banking office on Park Avenue, serving a select group of institutional clients.' },
  { year: '1999', title: 'International Expansion', desc: 'London and Singapore offices established. The first digital banking interface launched for HNW clients.' },
  { year: '2010', title: 'Digital Transformation', desc: 'Proprietary trading and settlement infrastructure rebuilt on a cloud-native stack, achieving sub-50ms response times.' },
  { year: '2019', title: 'Global Wire Network', desc: 'Launch of real-time international wire capabilities covering 150+ countries with same-day settlement.' },
  { year: '2024', title: 'Next-Generation Platform', desc: 'AI-powered fraud detection, biometric authentication, and a unified wealth dashboard rolled out to all clients.' },
];

const LEADERSHIP = [
  {
    name: 'Alexander Sterling', title: 'Chief Executive Officer',
    bio: 'Former Goldman Sachs Managing Director with 25 years of private banking experience across four continents.',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=85',
  },
  {
    name: 'Eleanor Chen', title: 'Chief Technology Officer',
    bio: 'Built payment infrastructure at Stripe and Adyen before joining Beacon Trust to lead the platform rebuild.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=85',
  },
  {
    name: 'Marcus Vance', title: 'Chief Risk Officer',
    bio: 'Former Bank of England regulator and architect of our zero-breach security framework.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=85',
  },
  {
    name: 'Priya Nair', title: 'Head of Private Banking',
    bio: 'Led private wealth divisions at Credit Suisse and UBS, managing portfolios exceeding $12B.',
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=85',
  },
];

const VALUES = [
  { icon: Shield, title: 'Unwavering', desc: 'Our security posture and fiduciary duty never waver, regardless of market conditions.' },
  { icon: Globe, title: 'Transparent', desc: 'No hidden fees, no conflicted advice. Full disclosure, always.' },
  { icon: TrendingUp, title: 'Enduring', desc: 'We build relationships measured in decades, not quarters.' },
  { icon: Award, title: 'Excellence', desc: 'Every interaction, every product, every outcome is held to the highest standard.' },
];

function FadeSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-[#02439A]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=90"
            alt="Beacon Trust HQ"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02439A] via-[#02439A]/90 to-[#02439A]/70" />
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-white/50 text-xs font-mono uppercase tracking-widest">The Institution</span>
            <h1 className="mt-4 text-6xl md:text-7xl font-serif font-bold text-white leading-tight max-w-3xl">
              A legacy of trust, built over decades.
            </h1>
            <p className="mt-6 text-xl text-white/70 max-w-2xl leading-relaxed">
              Founded in 1987, Beacon Trust has spent 37 years serving the world's most discerning private clients and institutions — from New York to Singapore.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission split */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <FadeSection>
              <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Our Mission</span>
              <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900 leading-tight">
                We exist to protect and grow what matters most.
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Beacon Trust was built on a single conviction: that the world's most successful people deserve a bank that operates at their level. Not a bank that moves fast and breaks things — one that moves with precision and never breaks anything.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                We combine the institutional depth of a global bank with the personal attention of a family office. Our clients aren't account numbers. They're partners.
              </p>
            </FadeSection>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=90"
                alt="Partnership"
                className="rounded-2xl w-full h-[480px] object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#02439A] text-white rounded-2xl p-6 shadow-xl">
                <div className="text-3xl font-bold font-mono">37</div>
                <div className="text-sm text-white/70 mt-1">Years of excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-28 bg-[#f5f8ff] border-y border-[#e8eef8]">
        <div className="container mx-auto px-4 md:px-8">
          <FadeSection className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Core Values</span>
            <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900">The principles we never compromise.</h2>
          </FadeSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((v, i) => (
              <FadeSection key={v.title} delay={i * 0.1} className="bg-white border border-[#e8eef8] rounded-2xl p-8 hover:shadow-lg hover:border-[#02439A]/20 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-[#02439A]/10 rounded-xl flex items-center justify-center text-[#02439A] mb-5">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <FadeSection className="max-w-2xl mb-16">
            <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Our History</span>
            <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900">Built for the long term.</h2>
          </FadeSection>
          <div className="relative">
            <div className="absolute left-[88px] top-0 bottom-0 w-px bg-[#e8eef8] hidden md:block" />
            <div className="space-y-12">
              {TIMELINE.map((item, i) => (
                <FadeSection key={item.year} delay={i * 0.08} className="flex gap-8 items-start">
                  <div className="flex-shrink-0 w-24 text-right">
                    <span className="text-[#02439A] font-mono font-bold text-sm">{item.year}</span>
                  </div>
                  <div className="relative flex-shrink-0 w-4 hidden md:block">
                    <div className="w-4 h-4 rounded-full border-2 border-[#02439A] bg-white mt-0.5 relative z-10" />
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                    <p className="mt-2 text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-28 bg-[#f5f8ff] border-t border-[#e8eef8]">
        <div className="container mx-auto px-4 md:px-8">
          <FadeSection className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#02439A] text-xs font-mono uppercase tracking-widest font-semibold">Leadership</span>
            <h2 className="mt-4 text-4xl font-serif font-bold text-slate-900">Guided by exceptional people.</h2>
          </FadeSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {LEADERSHIP.map((person, i) => (
              <FadeSection key={person.name} delay={i * 0.1}>
                <div className="group bg-white border border-[#e8eef8] rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#02439A]/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-56 overflow-hidden">
                    <img src={person.img} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02439A]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900">{person.name}</h3>
                    <div className="text-[#02439A] text-xs font-semibold uppercase tracking-wider mt-1">{person.title}</div>
                    <p className="text-slate-600 text-sm mt-3 leading-relaxed">{person.bio}</p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#02439A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <FadeSection>
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Ready to become a client?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Join the Beacon Trust family and experience banking at its finest.
            </p>
            <Link href="/register">
              <button className="bg-white text-[#02439A] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-xl inline-flex items-center gap-2">
                Begin Your Application <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </FadeSection>
        </div>
      </section>
    </PublicLayout>
  );
}

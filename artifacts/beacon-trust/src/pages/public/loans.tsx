import { useState } from 'react';
import { PublicLayout } from '@/components/layout/public-layout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Link } from 'wouter';

export default function Loans() {
  const [amount, setAmount] = useState([500000]);
  const [tenure, setTenure] = useState([120]);
  const interestRate = 6.5;

  // Simple EMI Calculation
  const p = amount[0];
  const r = (interestRate / 12) / 100;
  const n = tenure[0];
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;

  return (
    <PublicLayout>
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">Bespoke Credit Facilities</h1>
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
              Liquidity when you need it, structured intelligently. We offer asset-backed lending, prime mortgages, and corporate credit lines with rapid execution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start mb-24">
            <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-serif font-bold mb-6">Loan Calculator</h2>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-foreground">Loan Amount</label>
                    <span className="font-mono font-bold">${amount[0].toLocaleString()}</span>
                  </div>
                  <Slider 
                    value={amount} 
                    onValueChange={setAmount} 
                    max={5000000} 
                    min={50000} 
                    step={10000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$50K</span>
                    <span>$5M+</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-foreground">Term (Months)</label>
                    <span className="font-mono font-bold">{tenure[0]} months</span>
                  </div>
                  <Slider 
                    value={tenure} 
                    onValueChange={setTenure} 
                    max={360} 
                    min={12} 
                    step={12}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 yr</span>
                    <span>30 yrs</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estimated APR</span>
                    <span className="font-mono font-bold text-lg text-accent">{interestRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monthly Payment</span>
                    <span className="font-mono font-bold text-2xl text-foreground">${emi.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                  </div>
                </div>

                <Link href="/register" className="block mt-6">
                  <Button className="w-full bg-primary text-primary-foreground h-12 text-base">Apply Now</Button>
                </Link>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">Asset-Backed Lending</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Borrow against your investment portfolio, fine art, or luxury assets without liquidating them. Maintain your market position while accessing the cash you need instantly.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">Prime Mortgages</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Jumbo and super-jumbo mortgages for primary residences, secondary homes, and investment properties globally. Custom underwriting that understands complex income structures.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">Corporate Credit Lines</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Revolving credit facilities to smooth cash flow, bridge payables, and fund expansion. Structured against receivables, inventory, or enterprise valuation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
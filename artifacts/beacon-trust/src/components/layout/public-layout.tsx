import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from '@/lib/icons';
import { LiveChat } from '@/components/live-chat';

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleDashboardClick = () => {
    if (user?.role === 'admin') setLocation('/admin');
    else if (user?.role === 'staff') setLocation('/staff');
    else setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-accent-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Beacon Trust" className="h-10 w-auto object-contain" />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/personal-banking" className="text-foreground/80 hover:text-primary transition-colors">Personal</Link>
            <Link href="/business-banking" className="text-foreground/80 hover:text-primary transition-colors">Business</Link>
            <Link href="/loans" className="text-foreground/80 hover:text-primary transition-colors">Loans</Link>
            <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors">Institution</Link>
            <Link href="/help" className="text-foreground/80 hover:text-primary transition-colors">Support</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={handleDashboardClick} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                Enter Portal
              </Button>
            ) : (
              <>
                <Link href="/login" className="hidden sm:flex text-sm font-medium text-foreground hover:text-primary transition-colors items-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link href="/register">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium font-serif italic tracking-wide">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Become a Client
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="bg-card border-t py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Beacon Trust" className="h-8 w-auto object-contain" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A digital private bank for the world's most discerning individuals and institutions.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-foreground">Services</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/personal-banking" className="hover:text-primary">Wealth Management</Link></li>
                <li><Link href="/business-banking" className="hover:text-primary">Corporate Banking</Link></li>
                <li><Link href="/loans" className="hover:text-primary">Credit & Lending</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-foreground">Institution</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">Our History</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-foreground">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground font-mono">
              © {new Date().getFullYear()} Beacon Trust. All rights reserved. Member FDIC.
            </p>
            <p className="text-xs text-muted-foreground italic font-serif">
              Excellence in every transaction.
            </p>
          </div>
        </div>
      </footer>
      <LiveChat />
    </div>
  );
}

import { PublicLayout } from '@/components/layout/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Our relationship management team will contact you shortly.",
    });
  };

  return (
    <PublicLayout>
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">Initiate a Conversation.</h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Whether you are seeking private wealth management, corporate treasury solutions, or specialized lending, our advisors are ready to discuss your specific requirements in strict confidence.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Global Headquarters</h3>
                    <p className="text-muted-foreground font-mono text-sm">
                      Beacon Trust Tower<br />
                      One Financial Plaza, Suite 8000<br />
                      New York, NY 10005
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Private Client Desk</h3>
                    <p className="text-muted-foreground font-mono text-sm">+1 (800) BCN-TRST</p>
                    <p className="text-xs text-muted-foreground mt-1">Available 24/7 for existing clients</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">New Inquiries</h3>
                    <p className="text-muted-foreground font-mono text-sm">inquiries@beacontrust.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Send a Secure Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="John" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" required className="bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input type="email" placeholder="john@example.com" required className="bg-background/50 font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interest</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option>Private Wealth Management</option>
                    <option>Corporate Banking</option>
                    <option>Credit & Lending</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea placeholder="How can we assist you?" className="min-h-[120px] bg-background/50" required />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground h-12">Submit Inquiry</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
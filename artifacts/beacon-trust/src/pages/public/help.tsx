import { PublicLayout } from '@/components/layout/public-layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search } from '@/lib/icons';
import { Input } from '@/components/ui/input';

export default function Help() {
  const faqs = [
    {
      q: "How do I initiate an international wire transfer?",
      a: "International wire transfers can be initiated directly from your Client Portal under 'Transfer Funds'. Select 'International Wire', enter the beneficiary details including SWIFT/BIC and IBAN, and confirm with your security key. Cut-off time for same-day processing is 4:00 PM EST."
    },
    {
      q: "What are the limits on my Beacon Obsidian card?",
      a: "The Beacon Obsidian card has no pre-set spending limit. Transactions are approved based on your account balances, spending history, and overall relationship with the bank. For unusually large purchases (e.g., fine art, vehicles), we recommend notifying your Private Banker in advance to ensure seamless approval."
    },
    {
      q: "How is my account secured against unauthorized access?",
      a: "Beacon Trust employs defense-in-depth security. This includes mandatory biometric or hardware key multi-factor authentication (MFA), behavioral analytics that detect anomalous login patterns, and end-to-end encryption for all session data. Large transfers require out-of-band verbal confirmation."
    },
    {
      q: "Can I hold multiple currencies in a single account?",
      a: "Yes, our Private Client accounts natively support holding balances in over 40 fiat currencies simultaneously. You can execute spot exchanges between them instantly within the portal at tight interbank spreads without opening separate accounts."
    },
    {
      q: "How do I contact my dedicated Private Banker?",
      a: "Your Private Banker's direct secure line and email are listed on the dashboard of your Client Portal. Alternatively, you can open a secure message thread under the 'Support' section which is monitored 24/7 by our executive response team."
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-card border-b border-border/50 py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h1 className="text-4xl font-serif font-bold mb-6 text-foreground">How can we assist you?</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for answers..." 
              className="pl-12 h-14 text-lg bg-background border-border/50 shadow-sm rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors text-lg">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PublicLayout>
  );
}
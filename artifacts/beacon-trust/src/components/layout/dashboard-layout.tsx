import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/hooks/use-auth';
import { LiveChat } from '@/components/live-chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Users,
  LineChart,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  FileText,
  Briefcase,
  History,
  ShieldCheck,
  Building,
  UserPlus,
  Clock,
  Lock,
} from '@/lib/icons';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  if (!isLoading && !isAuthenticated) {
    setLocation('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      setLocation('/');
    }
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
            <Link href="/" className="flex items-center gap-3 w-full">
              <img src="/logo.png" alt="Beacon Trust" className="h-9 w-auto object-contain" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[0.55rem] font-mono tracking-widest text-muted-foreground uppercase truncate mt-1">
                  {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'staff' ? 'Staff Portal' : 'Private Client'}
                </span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {user?.role === 'customer' && (
              <>
                <SidebarGroup>
                  <SidebarGroupLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-4">Banking</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/dashboard"><LayoutDashboard /> Dashboard</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/accounts"><Wallet /> Accounts</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/transactions"><History /> Transactions</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/transfer"><ArrowRightLeft /> Transfer Funds</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-4">Wealth</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/cards"><CreditCard /> Cards</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/investments"><LineChart /> Investments</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/loans/portal"><Building /> Credit & Loans</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/beneficiaries"><Users /> Beneficiaries</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}

            {user?.role === 'admin' && (
              <SidebarGroup>
                <SidebarGroupLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-4">Administration</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin"><LayoutDashboard /> Overview</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/create-account"><UserPlus /> Create Account</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/account-requests"><Clock /> Account Requests</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/users"><Users /> Customers</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/kyc"><ShieldCheck /> KYC Verifications</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/pending-transfers"><Clock /> Pending Transfers</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/account-management"><Lock /> Account Lock / Unlock</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/transactions"><ArrowRightLeft /> Transactions</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/loans"><Briefcase /> Loan Approvals</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/tickets"><HelpCircle /> Support Tickets</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin/audit-logs"><FileText /> Audit Logs</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {user?.role === 'staff' && (
              <SidebarGroup>
                <SidebarGroupLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-4">Staff Operations</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/staff"><LayoutDashboard /> Overview</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/staff/customers"><Users /> Customer Lookup</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/staff/tickets"><HelpCircle /> Support Desk</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

          </SidebarContent>

          <SidebarFooter className="border-t border-border/50 p-4">
            <SidebarMenu>
              {user?.role === 'customer' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/notifications">
                        <Bell /> Notifications
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/support">
                        <HelpCircle /> Support
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
            
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-3">
              {isLoading ? (
                <div className="flex items-center gap-3 w-full">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start px-2 py-1.5 h-auto hover:bg-muted/50">
                      <Avatar className="h-8 w-8 rounded-md border border-border">
                        {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.firstName ?? ''} />}
                        <AvatarFallback className="rounded-md bg-primary/10 text-primary font-medium text-xs">
                          {user ? getInitials(user.firstName ?? '', user.lastName ?? '') : 'BT'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start ml-2 overflow-hidden">
                        <span className="text-sm font-medium truncate w-full">{user?.firstName} {user?.lastName}</span>
                        <span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 font-sans">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user?.role === 'customer' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="w-full cursor-pointer"><Settings className="mr-2 h-4 w-4" /> Profile Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/kyc" className="w-full cursor-pointer"><ShieldCheck className="mr-2 h-4 w-4" /> Verification Status</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto bg-background/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      {user?.role !== 'admin' && <LiveChat />}
    </SidebarProvider>
  );
}


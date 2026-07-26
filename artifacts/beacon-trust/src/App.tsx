import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

// Auth Guard
import { AuthGuard } from '@/components/layout/auth-guard';

// Public Pages
import Home from '@/pages/public/home';
import About from '@/pages/public/about';
import PersonalBanking from '@/pages/public/personal-banking';
import BusinessBanking from '@/pages/public/business-banking';
import Loans from '@/pages/public/loans';
import Help from '@/pages/public/help';
import Contact from '@/pages/public/contact';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import AuthCallback from '@/pages/auth/callback';
import AdminLogin from '@/pages/admin/login';
import AdminRegister from '@/pages/admin/register';

// Customer Pages
import CustomerDashboard from '@/pages/customer/dashboard';
import Accounts from '@/pages/customer/accounts';
import AccountDetail from '@/pages/customer/account-detail';
import Transactions from '@/pages/customer/transactions';
import Transfer from '@/pages/customer/transfer';
import Beneficiaries from '@/pages/customer/beneficiaries';
import Cards from '@/pages/customer/cards';
import LoansPortal from '@/pages/customer/loans';
import Investments from '@/pages/customer/investments';
import Notifications from '@/pages/customer/notifications';
import Support from '@/pages/customer/support';
import Kyc from '@/pages/customer/kyc';
import Profile from '@/pages/customer/profile';

// Admin Pages
import AdminDashboard from '@/pages/admin/dashboard';
import AdminCreateAccount from '@/pages/admin/create-account';
import AdminUsers from '@/pages/admin/users';
import AdminUserDetail from '@/pages/admin/user-detail';
import AdminKyc from '@/pages/admin/kyc';
import AdminTransactions from '@/pages/admin/transactions';
import AdminLoans from '@/pages/admin/loans';
import AdminTickets from '@/pages/admin/tickets';
import AdminAuditLogs from '@/pages/admin/audit-logs';
import AdminAccountRequests from '@/pages/admin/account-requests';
import AdminPendingTransfers from '@/pages/admin/pending-transfers';
import AdminAccountManagement from '@/pages/admin/account-management';

// Staff Pages
import StaffDashboard from '@/pages/staff/dashboard';
import StaffCustomers from '@/pages/staff/customers';
import StaffCustomerDetail from '@/pages/staff/customer-detail';
import StaffTickets from '@/pages/staff/tickets';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/personal-banking" component={PersonalBanking} />
      <Route path="/business-banking" component={BusinessBanking} />
      <Route path="/loans" component={Loans} />
      <Route path="/help" component={Help} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/auth/callback" component={AuthCallback} />

      {/* Customer Portal Routes (role=customer) */}
      <Route path="/dashboard">
        <AuthGuard allowedRoles={['customer']}><CustomerDashboard /></AuthGuard>
      </Route>
      <Route path="/accounts">
        <AuthGuard allowedRoles={['customer']}><Accounts /></AuthGuard>
      </Route>
      <Route path="/accounts/:id">
        <AuthGuard allowedRoles={['customer']}><AccountDetail /></AuthGuard>
      </Route>
      <Route path="/transactions">
        <AuthGuard allowedRoles={['customer']}><Transactions /></AuthGuard>
      </Route>
      <Route path="/transfer">
        <AuthGuard allowedRoles={['customer']}><Transfer /></AuthGuard>
      </Route>
      <Route path="/beneficiaries">
        <AuthGuard allowedRoles={['customer']}><Beneficiaries /></AuthGuard>
      </Route>
      <Route path="/cards">
        <AuthGuard allowedRoles={['customer']}><Cards /></AuthGuard>
      </Route>
      <Route path="/loans/portal">
        <AuthGuard allowedRoles={['customer']}><LoansPortal /></AuthGuard>
      </Route>
      <Route path="/investments">
        <AuthGuard allowedRoles={['customer']}><Investments /></AuthGuard>
      </Route>
      <Route path="/notifications">
        <AuthGuard allowedRoles={['customer']}><Notifications /></AuthGuard>
      </Route>
      <Route path="/support">
        <AuthGuard allowedRoles={['customer']}><Support /></AuthGuard>
      </Route>
      <Route path="/kyc">
        <AuthGuard allowedRoles={['customer']}><Kyc /></AuthGuard>
      </Route>
      <Route path="/profile">
        <AuthGuard allowedRoles={['customer']}><Profile /></AuthGuard>
      </Route>

      {/* Admin auth (public) */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />

      {/* Admin Portal Routes (role=admin) */}
      <Route path="/admin">
        <AuthGuard allowedRoles={['admin']}><AdminDashboard /></AuthGuard>
      </Route>
      <Route path="/admin/dashboard">
        <AuthGuard allowedRoles={['admin']}><AdminDashboard /></AuthGuard>
      </Route>
      <Route path="/admin/create-account">
        <AuthGuard allowedRoles={['admin']}><AdminCreateAccount /></AuthGuard>
      </Route>
      <Route path="/admin/users">
        <AuthGuard allowedRoles={['admin']}><AdminUsers /></AuthGuard>
      </Route>
      <Route path="/admin/users/:id">
        <AuthGuard allowedRoles={['admin']}><AdminUserDetail /></AuthGuard>
      </Route>
      <Route path="/admin/kyc">
        <AuthGuard allowedRoles={['admin']}><AdminKyc /></AuthGuard>
      </Route>
      <Route path="/admin/transactions">
        <AuthGuard allowedRoles={['admin']}><AdminTransactions /></AuthGuard>
      </Route>
      <Route path="/admin/loans">
        <AuthGuard allowedRoles={['admin']}><AdminLoans /></AuthGuard>
      </Route>
      <Route path="/admin/tickets">
        <AuthGuard allowedRoles={['admin']}><AdminTickets /></AuthGuard>
      </Route>
      <Route path="/admin/audit-logs">
        <AuthGuard allowedRoles={['admin']}><AdminAuditLogs /></AuthGuard>
      </Route>
      <Route path="/admin/account-requests">
        <AuthGuard allowedRoles={['admin']}><AdminAccountRequests /></AuthGuard>
      </Route>
      <Route path="/admin/pending-transfers">
        <AuthGuard allowedRoles={['admin']}><AdminPendingTransfers /></AuthGuard>
      </Route>
      <Route path="/admin/account-management">
        <AuthGuard allowedRoles={['admin']}><AdminAccountManagement /></AuthGuard>
      </Route>

      {/* Staff Portal Routes (role=staff or admin) */}
      <Route path="/staff">
        <AuthGuard allowedRoles={['staff', 'admin']}><StaffDashboard /></AuthGuard>
      </Route>
      <Route path="/staff/customers">
        <AuthGuard allowedRoles={['staff', 'admin']}><StaffCustomers /></AuthGuard>
      </Route>
      <Route path="/staff/customers/:id">
        <AuthGuard allowedRoles={['staff', 'admin']}><StaffCustomerDetail /></AuthGuard>
      </Route>
      <Route path="/staff/tickets">
        <AuthGuard allowedRoles={['staff', 'admin']}><StaffTickets /></AuthGuard>
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

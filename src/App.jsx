import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useTelegramWebApp } from '@/lib/TelegramWebApp';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Routes that require verified access
const PROTECTED_ROUTES = ['Cart', 'Checkout', 'Profile', 'ProfileSettings', 'Wishlist', 'Requests', 'OrderConfirmation'];
// Routes that require admin access
const ADMIN_ROUTES = ['Admin', 'AdminAnalytics', 'AdminUsers', 'AdminOrders', 'AdminBrands', 'AdminCategories',
  'AdminNotificationTemplates', 'AdminProductEditor', 'AdminProducts', 'AdminRequests',
  'AdminSupport', 'AdminLiveChat', 'AdminVerifications'];

import ProtectedRoute, { AdminRoute } from '@/components/auth/ProtectedRoute';

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Initialize Telegram WebApp if available
  useTelegramWebApp();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0A0C10]">
        <div className="w-8 h-8 border-4 border-[#D6B25E]/20 border-t-[#D6B25E] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle critical authentication errors only
  // Guest mode is allowed - no automatic redirect for browsing
  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Helper to wrap page with appropriate protection
  const wrapWithProtection = (path, Page) => {
    if (ADMIN_ROUTES.includes(path)) {
      return (
        <AdminRoute>
          <LayoutWrapper currentPageName={path}>
            <Page />
          </LayoutWrapper>
        </AdminRoute>
      );
    }
    // DEVELOPMENT: Protected routes verification disabled
    // if (PROTECTED_ROUTES.includes(path)) {
    //   return (
    //     <ProtectedRoute>
    //       <LayoutWrapper currentPageName={path}>
    //         <Page />
    //       </LayoutWrapper>
    //     </ProtectedRoute>
    //   );
    // }
    return (
      <LayoutWrapper currentPageName={path}>
        <Page />
      </LayoutWrapper>
    );
  };

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Pages.Login />} />
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => {
        // Skip Login as it's already handled above
        if (path === 'Login') return null;
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={wrapWithProtection(path, Page)}
          />
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


import { SocketProvider } from '@/contexts/SocketContext';
import { SoundProvider } from '@/contexts/SoundContext';
import TelegramRealtimeListener from '@/components/TelegramRealtimeListener';
import AdminRealtimeListener from '@/components/admin/AdminRealtimeListener';
import UserRealtimeListener from '@/components/UserRealtimeListener';
import LiveChatWidget from '@/components/LiveChatWidget';
import ScrollToTop from '@/components/ScrollToTop';
import SocialProof from '@/components/trust/SocialProof';

import { ProductModalProvider } from '@/contexts/ProductModalContext';
import GlobalProductModal from '@/components/products/GlobalProductModal';
import { I18nProvider } from '@/components/i18n/I18nProvider';
import { WishlistProvider } from '@/components/wishlist/WishlistContext';
import { HelmetProvider } from 'react-helmet-async';

function App() {

  return (
    <AuthProvider>
      <SocketProvider>
        <SoundProvider>
          <ProductModalProvider>
            <WishlistProvider>
              <I18nProvider>
                <HelmetProvider>
                  <QueryClientProvider client={queryClientInstance}>
                    <Router>
                      <NavigationTracker />
                      <TelegramRealtimeListener />
                      <AdminRealtimeListener />
                      <UserRealtimeListener />
                      <AuthenticatedApp />
                      <GlobalProductModal />
                      <LiveChatWidget />
                      <SocialProof />
                      <ScrollToTop />
                    </Router>
                    <Toaster />
                  </QueryClientProvider>
                </HelmetProvider>
              </I18nProvider>
            </WishlistProvider>
          </ProductModalProvider>
        </SoundProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App

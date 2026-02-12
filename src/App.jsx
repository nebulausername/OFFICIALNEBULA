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
const PROTECTED_ROUTES = ['Home', 'Shop', 'Products', 'ProductDetail', 'Cart', 'Checkout', 'Profile', 'ProfileSettings', 'Wishlist', 'Requests', 'OrderConfirmation', 'VIP', 'Support', 'Tickets', 'SupportTicketDetail'];
// Routes that require admin access
const ADMIN_ROUTES = ['Admin', 'AdminAnalytics', 'AdminUsers', 'AdminOrders', 'AdminBrands', 'AdminCategories',
  'AdminNotificationTemplates', 'AdminProductEditor', 'AdminProducts', 'AdminRequests',
  'AdminSupport', 'AdminLiveChat', 'AdminVerifications', 'AdminTelegramSettings'];

import ProtectedRoute, { AdminRoute } from '@/components/auth/ProtectedRoute';

import { Suspense } from 'react';

// Helper to wrap page with appropriate protection and animation
const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
        <div className="w-8 h-8 border-4 border-[#D6B25E]/20 border-t-[#D6B25E] rounded-full animate-spin"></div>
      </div>
    }>
      {children}
    </Suspense>
  </Layout>
  : <>{children}</>;

import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import MotionWrapper from '@/components/ui/MotionWrapper';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();

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

  // Helper to wrap page with appropriate protection and animation
  const wrapWithProtection = (path, Page) => {
    let Content = (
      <LayoutWrapper currentPageName={path}>
        <Page />
      </LayoutWrapper>
    );

    // Gate shop/user routes behind authentication
    if (PROTECTED_ROUTES.includes(path)) {
      Content = (
        <ProtectedRoute>
          {Content}
        </ProtectedRoute>
      );
    }

    if (ADMIN_ROUTES.includes(path)) {
      Content = (
        <AdminRoute>
          {Content}
        </AdminRoute>
      );
    }

    return (
      <MotionWrapper className="w-full h-full">
        {Content}
      </MotionWrapper>
    );
  };

  // Render the main app
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <MotionWrapper className="w-full h-full">
            <Pages.Login />
          </MotionWrapper>
        } />
        <Route path="/" element={wrapWithProtection(mainPageKey, Pages[mainPageKey])} />
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
        {/* Manual Route for Ticket Details with ID */}
        <Route path="/ticket/:id" element={wrapWithProtection('TicketDetail', Pages.TicketDetail)} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
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
import SmoothScroll from '@/components/ui/SmoothScroll';
import CustomCursor from '@/components/ui/CustomCursor';

import { ProductModalProvider } from '@/contexts/ProductModalContext';
import GlobalProductModal from '@/components/products/GlobalProductModal';
import { I18nProvider } from '@/components/i18n/I18nProvider';
import { WishlistProvider } from '@/components/wishlist/WishlistContext';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from '@/contexts/CartContext';
import GlobalCartDrawer from '@/components/cart/GlobalCartDrawer';

function App() {

  return (
    <AuthProvider>
      <SocketProvider>
        <SoundProvider>
          <ProductModalProvider>
            <WishlistProvider>
              <CartProvider>
                <I18nProvider>
                  <HelmetProvider>
                    <QueryClientProvider client={queryClientInstance}>
                      <Router>
                        <NavigationTracker />
                        <TelegramRealtimeListener />
                        <AdminRealtimeListener />
                        <UserRealtimeListener />
                        <AuthenticatedApp />
                        <GlobalCartDrawer />
                        <GlobalProductModal />
                        <LiveChatWidget />
                        <SocialProof />
                        <ScrollToTop />
                        <SmoothScroll />
                      </Router>
                      <Toaster />
                      <CustomCursor />
                    </QueryClientProvider>
                  </HelmetProvider>
                </I18nProvider>
              </CartProvider>
            </WishlistProvider>
          </ProductModalProvider>
        </SoundProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App

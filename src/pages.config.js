import { lazy } from 'react';

// Eager load critical pages
import Home from './pages/Home';
import AccessGate from './pages/AccessGate';
import __Layout from './Layout.jsx';

// Lazy load secondary & admin pages
const Admin = lazy(() => import('./pages/Admin'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminBrands = lazy(() => import('./pages/AdminBrands'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminNotificationTemplates = lazy(() => import('./pages/AdminNotificationTemplates'));
const AdminProductEditor = lazy(() => import('./pages/AdminProductEditor'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminRequests = lazy(() => import('./pages/AdminRequests'));
const AdminSupport = lazy(() => import('./pages/AdminSupport'));
const AdminLiveChat = lazy(() => import('./pages/AdminLiveChat'));
const AdminVerifications = lazy(() => import('./pages/AdminVerifications'));
const AdminSystemMonitor = lazy(() => import('./pages/AdminSystemMonitor'));
const AdminTelegramSettings = lazy(() => import('./pages/AdminTelegramSettings'));

const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Help = lazy(() => import('./pages/Help'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Products = lazy(() => import('./pages/Products'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const Requests = lazy(() => import('./pages/Requests'));
const Support = lazy(() => import('./pages/Support'));
const SupportTicketDetail = lazy(() => import('./pages/SupportTicketDetail'));
const VIP = lazy(() => import('./pages/VIP'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Tickets = lazy(() => import('./pages/Tickets'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));

export const PAGES = {
    "Admin": Admin,
    "AdminAnalytics": AdminAnalytics,
    "AdminUsers": AdminUsers,
    "AdminOrders": AdminOrders,
    "AdminBrands": AdminBrands,
    "AdminCategories": AdminCategories,
    "AdminNotificationTemplates": AdminNotificationTemplates,
    "AdminProductEditor": AdminProductEditor,
    "AdminProducts": AdminProducts,
    "AdminRequests": AdminRequests,
    "AdminSupport": AdminSupport,
    "AdminLiveChat": AdminLiveChat,
    "AdminVerifications": AdminVerifications,
    "AdminSystemMonitor": AdminSystemMonitor,
    "AdminTelegramSettings": AdminTelegramSettings,
    "Cart": Cart,

    "Checkout": Checkout,
    "FAQ": FAQ,
    "Help": Help,
    "Home": Home,
    "OrderConfirmation": OrderConfirmation,
    "ProductDetail": ProductDetail,
    "Products": Products,
    "Profile": Profile,
    "ProfileSettings": ProfileSettings,
    "Requests": Requests,
    "Support": Support,
    "SupportTicketDetail": SupportTicketDetail,
    "VIP": VIP,
    "Wishlist": Wishlist,
    "DebugAuth": lazy(() => import('./pages/DebugAuth')),
    "Tickets": Tickets,
    "TicketDetail": TicketDetail,
    "Login": AccessGate,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
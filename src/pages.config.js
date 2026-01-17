import Admin from './pages/Admin';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminBrands from './pages/AdminBrands';
import AdminCategories from './pages/AdminCategories';
import AdminNotificationTemplates from './pages/AdminNotificationTemplates';
import AdminProductEditor from './pages/AdminProductEditor';
import AdminProducts from './pages/AdminProducts';
import AdminRequests from './pages/AdminRequests';
import AdminSupport from './pages/AdminSupport';
import AdminVerifications from './pages/AdminVerifications';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import FAQ from './pages/FAQ';
import Help from './pages/Help';
import Home from './pages/Home';
import OrderConfirmation from './pages/OrderConfirmation';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Profile from './pages/Profile';
import ProfileSettings from './pages/ProfileSettings';
import Requests from './pages/Requests';
import Support from './pages/Support';
import SupportTicketDetail from './pages/SupportTicketDetail';
import VIP from './pages/VIP';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import __Layout from './Layout.jsx';


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
    "AdminVerifications": AdminVerifications,
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
    "Login": Login,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
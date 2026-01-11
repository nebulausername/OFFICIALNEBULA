import Admin from './pages/Admin';
import AdminBrands from './pages/AdminBrands';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminRequests from './pages/AdminRequests';
import AdminSupport from './pages/AdminSupport';
import Cart from './pages/Cart';
import FAQ from './pages/FAQ';
import Help from './pages/Help';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Profile from './pages/Profile';
import ProfileSettings from './pages/ProfileSettings';
import Requests from './pages/Requests';
import Support from './pages/Support';
import SupportTicketDetail from './pages/SupportTicketDetail';
import VIP from './pages/VIP';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminNotificationTemplates from './pages/AdminNotificationTemplates';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminBrands": AdminBrands,
    "AdminCategories": AdminCategories,
    "AdminProducts": AdminProducts,
    "AdminRequests": AdminRequests,
    "AdminSupport": AdminSupport,
    "Cart": Cart,
    "FAQ": FAQ,
    "Help": Help,
    "Home": Home,
    "ProductDetail": ProductDetail,
    "Products": Products,
    "Profile": Profile,
    "ProfileSettings": ProfileSettings,
    "Requests": Requests,
    "Support": Support,
    "SupportTicketDetail": SupportTicketDetail,
    "VIP": VIP,
    "Wishlist": Wishlist,
    "Checkout": Checkout,
    "OrderConfirmation": OrderConfirmation,
    "AdminNotificationTemplates": AdminNotificationTemplates,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
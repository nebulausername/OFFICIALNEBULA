import Admin from './pages/Admin';
import AdminBrands from './pages/AdminBrands';
import AdminCategories from './pages/AdminCategories';
import AdminNotificationTemplates from './pages/AdminNotificationTemplates';
import AdminProducts from './pages/AdminProducts';
import AdminRequests from './pages/AdminRequests';
import AdminSupport from './pages/AdminSupport';
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
import AdminProductEditor from './pages/AdminProductEditor';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminBrands": AdminBrands,
    "AdminCategories": AdminCategories,
    "AdminNotificationTemplates": AdminNotificationTemplates,
    "AdminProducts": AdminProducts,
    "AdminRequests": AdminRequests,
    "AdminSupport": AdminSupport,
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
    "AdminProductEditor": AdminProductEditor,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
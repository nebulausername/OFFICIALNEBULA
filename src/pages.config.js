import Admin from './pages/Admin';
import AdminBrands from './pages/AdminBrands';
import AdminCategories from './pages/AdminCategories';
import AdminNotificationTemplates from './pages/AdminNotificationTemplates';
import AdminProductEditor from './pages/AdminProductEditor';
import AdminProducts from './pages/AdminProducts';
import AdminRequests from './pages/AdminRequests';
import AdminSupport from './pages/AdminSupport';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import FAQ from './pages/FAQ';
import Help from './pages/Help';
import OrderConfirmation from './pages/OrderConfirmation';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import ProfileSettings from './pages/ProfileSettings';
import Requests from './pages/Requests';
import Support from './pages/Support';
import SupportTicketDetail from './pages/SupportTicketDetail';
import VIP from './pages/VIP';
import Wishlist from './pages/Wishlist';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminBrands": AdminBrands,
    "AdminCategories": AdminCategories,
    "AdminNotificationTemplates": AdminNotificationTemplates,
    "AdminProductEditor": AdminProductEditor,
    "AdminProducts": AdminProducts,
    "AdminRequests": AdminRequests,
    "AdminSupport": AdminSupport,
    "Cart": Cart,
    "Checkout": Checkout,
    "FAQ": FAQ,
    "Help": Help,
    "OrderConfirmation": OrderConfirmation,
    "ProductDetail": ProductDetail,
    "Products": Products,
    "ProfileSettings": ProfileSettings,
    "Requests": Requests,
    "Support": Support,
    "SupportTicketDetail": SupportTicketDetail,
    "VIP": VIP,
    "Wishlist": Wishlist,
}

export const pagesConfig = {
    mainPage: "Admin",
    Pages: PAGES,
    Layout: __Layout,
};
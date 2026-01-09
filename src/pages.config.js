import Admin from './pages/Admin';
import AdminBrands from './pages/AdminBrands';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminRequests from './pages/AdminRequests';
import Cart from './pages/Cart';
import FAQ from './pages/FAQ';
import Help from './pages/Help';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import VIP from './pages/VIP';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminBrands": AdminBrands,
    "AdminCategories": AdminCategories,
    "AdminProducts": AdminProducts,
    "AdminRequests": AdminRequests,
    "Cart": Cart,
    "FAQ": FAQ,
    "Help": Help,
    "Home": Home,
    "ProductDetail": ProductDetail,
    "Products": Products,
    "Profile": Profile,
    "Requests": Requests,
    "VIP": VIP,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
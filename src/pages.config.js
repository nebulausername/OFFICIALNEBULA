import Admin from './pages/Admin';
import AdminBrands from './pages/AdminBrands';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminRequests from './pages/AdminRequests';
import Cart from './pages/Cart';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import Help from './pages/Help';
import FAQ from './pages/FAQ';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminBrands": AdminBrands,
    "AdminCategories": AdminCategories,
    "AdminProducts": AdminProducts,
    "AdminRequests": AdminRequests,
    "Cart": Cart,
    "Home": Home,
    "ProductDetail": ProductDetail,
    "Products": Products,
    "Requests": Requests,
    "Profile": Profile,
    "Help": Help,
    "FAQ": FAQ,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Requests from './pages/Requests';
import Admin from './pages/Admin';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminBrands from './pages/AdminBrands';
import AdminRequests from './pages/AdminRequests';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Products": Products,
    "ProductDetail": ProductDetail,
    "Cart": Cart,
    "Requests": Requests,
    "Admin": Admin,
    "AdminProducts": AdminProducts,
    "AdminCategories": AdminCategories,
    "AdminBrands": AdminBrands,
    "AdminRequests": AdminRequests,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
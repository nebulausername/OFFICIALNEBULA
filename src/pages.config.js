import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Products": Products,
    "ProductDetail": ProductDetail,
    "Cart": Cart,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
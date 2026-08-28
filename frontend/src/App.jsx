import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PageLoader from "./components/PageLoader";
import { QuoteCartProvider } from "./context/QuoteCartContext";
import { ProductQuickViewProvider } from "./context/ProductQuickViewContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLayout from "./components/admin/AdminLayout";

const About = lazy(() => import("./pages/About"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Services = lazy(() => import("./pages/Services"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));

export default function App() {
  return (
    <AdminAuthProvider>
      <QuoteCartProvider>
        <ProductQuickViewProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="messages" element={<AdminMessages />} />
                </Route>

                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProductQuickViewProvider>
      </QuoteCartProvider>
    </AdminAuthProvider>
  );
}

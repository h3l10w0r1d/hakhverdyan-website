import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PageLoader from "./components/PageLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import lazyWithReload from "./lib/lazyWithReload";
import { QuoteCartProvider } from "./context/QuoteCartContext";
import { ProductQuickViewProvider } from "./context/ProductQuickViewContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLayout from "./components/admin/AdminLayout";

const About = lazyWithReload(() => import("./pages/About"));
const Catalog = lazyWithReload(() => import("./pages/Catalog"));
const Services = lazyWithReload(() => import("./pages/Services"));
const ServiceDetail = lazyWithReload(() => import("./pages/ServiceDetail"));
const Contacts = lazyWithReload(() => import("./pages/Contacts"));
const Blog = lazyWithReload(() => import("./pages/Blog"));
const BlogPost = lazyWithReload(() => import("./pages/BlogPost"));

const AdminLogin = lazyWithReload(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazyWithReload(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazyWithReload(() => import("./pages/admin/AdminProducts"));
const AdminBlog = lazyWithReload(() => import("./pages/admin/AdminBlog"));
const AdminPartners = lazyWithReload(() => import("./pages/admin/AdminPartners"));
const AdminBookings = lazyWithReload(() => import("./pages/admin/AdminBookings"));
const AdminMessages = lazyWithReload(() => import("./pages/admin/AdminMessages"));

export default function App() {
  return (
    <AdminAuthProvider>
      <QuoteCartProvider>
        <ProductQuickViewProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="partners" element={<AdminPartners />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="messages" element={<AdminMessages />} />
                  </Route>

                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:slug" element={<ServiceDetail />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </ProductQuickViewProvider>
      </QuoteCartProvider>
    </AdminAuthProvider>
  );
}

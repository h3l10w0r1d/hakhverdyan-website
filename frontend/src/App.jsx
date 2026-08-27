import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { QuoteCartProvider } from "./context/QuoteCartContext";
import { ProductQuickViewProvider } from "./context/ProductQuickViewContext";

const About = lazy(() => import("./pages/About"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Services = lazy(() => import("./pages/Services"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

export default function App() {
  return (
    <QuoteCartProvider>
      <ProductQuickViewProvider>
        <BrowserRouter>
          <Routes>
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
        </BrowserRouter>
      </ProductQuickViewProvider>
    </QuoteCartProvider>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchProducts } from "../lib/api";
import ProductCard from "./ProductCard";

// A curated subset shown on the homepage — one from each category, ABS sheet promo included.
const FEATURED_IDS = ["alu-t40", "pvc-10", "maco-handle", "abs-sheet", "ss-sheet", "int-door", "sect-gate", "glass-facade"];

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const TABS = [
    { key: "all", label: t("catalog.tabAll") },
    { key: "profiles", label: t("catalog.tabProfiles") },
    { key: "hardware", label: t("catalog.tabHardware") },
    { key: "sheets", label: t("catalog.tabSheets") },
    { key: "doors", label: t("catalog.tabDoors") },
    { key: "facades", label: t("catalog.tabFacades") },
  ];

  useEffect(() => {
    fetchProducts()
      .then(all => setProducts(all.filter(p => FEATURED_IDS.includes(p.id))))
      .catch(() => setProducts([]));
  }, []);

  const visible = activeTab === "all" ? products : products.filter(p => p.category === activeTab);

  return (
    <>
      <div className="filter-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={"filter-tab" + (activeTab === tab.key ? " active" : "")}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {visible.map(p => <ProductCard key={p.id} product={p} reveal={false} />)}
      </div>
    </>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import ProductDetailModal from "../components/ProductDetailModal";
import { CategoryId, useGetAllProducts } from "../hooks/useQueries";

type FilterCategory = "all" | CategoryId;

const SAMPLE_PRODUCTS = [
  {
    id: "sample-1",
    title: "Athena Silk Gown",
    description:
      "A breathtaking floor-length silk gown with intricate hand-stitched embroidery. Perfect for gala evenings and black-tie occasions.",
    category: CategoryId.dress,
    price: 2450,
    image: {
      getDirectURL: () => "/assets/generated/product-dress-1.dim_600x800.jpg",
    },
    createdAt: BigInt(0),
  },
  {
    id: "sample-2",
    title: "Velvet Noir Dress",
    description:
      "Deep black velvet cocktail dress with delicate lace trim. An evening classic reimagined with modern silhouette.",
    category: CategoryId.dress,
    price: 1890,
    image: {
      getDirectURL: () => "/assets/generated/product-dress-2.dim_600x800.jpg",
    },
    createdAt: BigInt(0),
  },
  {
    id: "sample-3",
    title: "Champagne Strappy Heels",
    description:
      "Handcrafted Italian leather heels with delicate ankle straps. Elevate any ensemble with effortless sophistication.",
    category: CategoryId.shoes,
    price: 785,
    image: {
      getDirectURL: () => "/assets/generated/product-shoes-1.dim_600x800.jpg",
    },
    createdAt: BigInt(0),
  },
  {
    id: "sample-4",
    title: "Bordeaux Pointed Pumps",
    description:
      "Classic pointed-toe pumps in rich burgundy leather. A wardrobe essential for the discerning woman.",
    category: CategoryId.shoes,
    price: 695,
    image: {
      getDirectURL: () => "/assets/generated/product-shoes-2.dim_600x800.jpg",
    },
    createdAt: BigInt(0),
  },
  {
    id: "sample-5",
    title: "Pearl & Gold Collar",
    description:
      "Statement collar necklace featuring freshwater pearls and 18k gold-plated links. The epitome of refined elegance.",
    category: CategoryId.accessories,
    price: 1250,
    image: {
      getDirectURL: () =>
        "/assets/generated/product-accessory-1.dim_600x800.jpg",
    },
    createdAt: BigInt(0),
  },
  {
    id: "sample-6",
    title: "Crystal Evening Clutch",
    description:
      "Silk and crystal minaudière with gold hardware. The perfect companion for evenings that demand perfection.",
    category: CategoryId.accessories,
    price: 920,
    image: {
      getDirectURL: () =>
        "/assets/generated/product-accessory-2.dim_600x800.jpg",
    },
    createdAt: BigInt(0),
  },
];

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"];

const CATEGORIES: { label: string; value: FilterCategory }[] = [
  { label: "All", value: "all" },
  { label: "Dresses", value: CategoryId.dress },
  { label: "Shoes", value: CategoryId.shoes },
  { label: "Accessories", value: CategoryId.accessories },
];

const CATEGORY_LABEL: Record<CategoryId, string> = {
  [CategoryId.dress]: "Dress",
  [CategoryId.shoes]: "Shoes",
  [CategoryId.accessories]: "Accessories",
};

interface StorefrontPageProps {
  onNavigateAdmin: () => void;
}

export default function StorefrontPage({
  onNavigateAdmin,
}: StorefrontPageProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof SAMPLE_PRODUCTS)[0] | null
  >(null);
  const [cartCount, setCartCount] = useState(0);

  const { data: backendProducts = [], isLoading } = useGetAllProducts();

  const allProducts =
    backendProducts.length > 0
      ? backendProducts.map((p, i) => ({ ...p, id: `backend-${i}` }))
      : SAMPLE_PRODUCTS;

  const filteredProducts =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  const handleAddToCart = () => setCartCount((c) => c + 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <nav className="hidden md:flex items-center gap-8">
            {CATEGORIES.slice(1).map((cat) => (
              <button
                type="button"
                key={cat.value}
                data-ocid={`nav.${cat.value}.link`}
                onClick={() => {
                  setActiveCategory(cat.value);
                  document
                    .getElementById("catalog")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="luxury-sans opacity-70 hover:opacity-100 transition-opacity text-primary-foreground"
              >
                {cat.label}
              </button>
            ))}
          </nav>

          <div className="text-center flex-1 md:flex-none">
            <h1 className="font-serif text-xl tracking-[0.3em] uppercase text-primary-foreground font-bold">
              Élévation
            </h1>
            <p className="luxury-sans text-[0.6rem] opacity-60 tracking-[0.4em] text-primary-foreground">
              PARIS
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-primary-foreground" />
            </button>
            <button
              type="button"
              data-ocid="nav.admin.link"
              onClick={onNavigateAdmin}
              className="opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Admin"
            >
              <User className="w-4 h-4 text-primary-foreground" />
            </button>
            <button
              type="button"
              data-ocid="nav.cart.button"
              className="relative opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Announcement bar */}
        <div className="border-t border-white/10 py-1.5 text-center">
          <p className="luxury-sans opacity-50 text-primary-foreground">
            Complimentary shipping on orders over $500
          </p>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative h-[80vh] min-h-[560px] flex items-center"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-fashion.dim_1600x900.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/30 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-lg"
          >
            <p className="luxury-sans text-secondary/80 mb-4">
              New Collection 2026
            </p>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-4">
              Dressed in
              <br />
              <em className="italic font-normal">Pure Luxury</em>
            </h2>
            <p className="text-primary-foreground/70 mb-8 text-base leading-relaxed">
              Discover our curated collection of premium dresses, shoes, and
              accessories for the modern connoisseur.
            </p>
            <Button
              data-ocid="hero.primary_button"
              onClick={() =>
                document
                  .getElementById("catalog")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 luxury-sans px-10 py-6 rounded-none"
            >
              Shop Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="luxury-sans text-muted-foreground mb-2">
              Our Collection
            </p>
            <h2 className="font-serif text-4xl font-bold">New Arrivals</h2>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.value}
                data-ocid={`catalog.${cat.value === "all" ? "all" : cat.value}.tab`}
                onClick={() => setActiveCategory(cat.value)}
                className={`luxury-sans px-6 py-2 border transition-colors ${
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div
              data-ocid="catalog.loading_state"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {SKELETON_KEYS.map((k) => (
                <div
                  key={k}
                  className="bg-muted animate-pulse aspect-[3/4] rounded"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div data-ocid="catalog.empty_state" className="text-center py-20">
              <p className="font-serif text-2xl text-muted-foreground">
                No products found
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Check back soon for new arrivals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  data-ocid={`catalog.item.${i + 1}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProduct(product as any)}
                >
                  <div className="relative overflow-hidden aspect-[3/4] bg-card mb-3">
                    <img
                      src={product.image.getDirectURL()}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                    <button
                      type="button"
                      data-ocid={`catalog.view_detail.button.${i + 1}`}
                      className="absolute bottom-4 left-4 right-4 bg-primary text-primary-foreground text-center luxury-sans py-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product as any);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                  <Badge
                    variant="outline"
                    className="luxury-sans text-[10px] border-secondary/50 text-muted-foreground mb-1"
                  >
                    {CATEGORY_LABEL[product.category]}
                  </Badge>
                  <h3 className="font-serif text-sm font-semibold truncate">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    ${product.price.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="luxury-sans text-muted-foreground mb-2">Browse By</p>
            <h2 className="font-serif text-4xl font-bold">Shop Categories</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Dresses",
                image: "/assets/generated/category-dresses.dim_800x600.jpg",
                value: CategoryId.dress,
              },
              {
                label: "Shoes",
                image: "/assets/generated/category-shoes.dim_800x600.jpg",
                value: CategoryId.shoes,
              },
              {
                label: "Accessories",
                image: "/assets/generated/category-accessories.dim_800x600.jpg",
                value: CategoryId.accessories,
              },
            ].map((cat, i) => (
              <motion.button
                type="button"
                key={cat.value}
                data-ocid={`categories.${cat.value}.button`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group overflow-hidden aspect-[4/3] text-left"
                onClick={() => {
                  setActiveCategory(cat.value);
                  document
                    .getElementById("catalog")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-1">
                    {cat.label}
                  </h3>
                  <span className="luxury-sans text-secondary/80 flex items-center gap-1">
                    Shop Now <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <h2 className="font-serif text-2xl tracking-widest mb-2">
                Élévation
              </h2>
              <p className="luxury-sans text-[0.6rem] tracking-[0.4em] opacity-50 mb-4">
                PARIS
              </p>
              <p className="text-primary-foreground/60 text-sm leading-relaxed">
                Curating luxury fashion for those who appreciate the finest
                details.
              </p>
            </div>
            {[
              {
                title: "Shop",
                links: [
                  "New Arrivals",
                  "Dresses",
                  "Shoes",
                  "Accessories",
                  "Sale",
                ],
              },
              {
                title: "About",
                links: [
                  "Our Story",
                  "Sustainability",
                  "Craftsmanship",
                  "Press",
                ],
              },
              {
                title: "Support",
                links: ["Sizing Guide", "Returns", "Shipping", "Contact"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="luxury-sans text-primary-foreground/80 mb-5">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-primary-foreground/50 text-sm">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/40 text-sm">
              &copy; {new Date().getFullYear()} Élévation Paris. All rights
              reserved.
            </p>
            <p className="text-primary-foreground/30 text-xs">
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="hover:text-primary-foreground/60 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct as any}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}

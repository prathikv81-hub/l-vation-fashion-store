import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { CategoryId, type Product } from "../hooks/useQueries";

const CATEGORY_LABEL: Record<CategoryId, string> = {
  [CategoryId.dress]: "Dress",
  [CategoryId.shoes]: "Shoes",
  [CategoryId.accessories]: "Accessories",
};

interface ProductDetailModalProps {
  product: Product & { id: string };
  onClose: () => void;
  onAddToCart: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        data-ocid="product_detail.modal"
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss */}
        <div
          className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          className="relative bg-background w-full md:max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          <button
            type="button"
            data-ocid="product_detail.close_button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 bg-background/80 hover:bg-background transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full md:w-1/2 aspect-[3/4] flex-shrink-0">
            <img
              src={product.image.getDirectURL()}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 p-8 flex flex-col justify-center">
            <Badge
              variant="outline"
              className="w-fit luxury-sans text-[10px] mb-4 border-secondary/50"
            >
              {CATEGORY_LABEL[product.category]}
            </Badge>
            <h2 className="font-serif text-3xl font-bold mb-3">
              {product.title}
            </h2>
            <p className="font-serif text-2xl text-muted-foreground mb-6">
              ${product.price.toLocaleString()}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              {product.description}
            </p>
            <div className="flex gap-3">
              <Button
                data-ocid="product_detail.primary_button"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none luxury-sans py-6"
                onClick={() => {
                  onAddToCart();
                  onClose();
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Bag
              </Button>
              <Button
                data-ocid="product_detail.cancel_button"
                variant="outline"
                className="rounded-none border-primary luxury-sans py-6 px-6"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

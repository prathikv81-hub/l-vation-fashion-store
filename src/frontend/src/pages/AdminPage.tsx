import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  CategoryId,
  type Product,
  type ProductInput,
  useAddProduct,
  useDeleteProduct,
  useGetAllProducts,
  useIsCallerAdmin,
  useUpdateProduct,
} from "../hooks/useQueries";

const CATEGORY_OPTIONS = [
  { label: "Dress", value: CategoryId.dress },
  { label: "Shoes", value: CategoryId.shoes },
  { label: "Accessories", value: CategoryId.accessories },
];

const CATEGORY_LABEL: Record<CategoryId, string> = {
  [CategoryId.dress]: "Dress",
  [CategoryId.shoes]: "Shoes",
  [CategoryId.accessories]: "Accessories",
};

interface FormData {
  title: string;
  description: string;
  price: string;
  category: CategoryId;
  imageFile: File | null;
  existingImageUrl: string;
}

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  price: "",
  category: CategoryId.dress,
  imageFile: null,
  existingImageUrl: "",
};

interface AdminPageProps {
  onNavigateBack: () => void;
}

export default function AdminPage({ onNavigateBack }: AdminPageProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: products = [], isLoading: productsLoading } =
    useGetAllProducts();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (product: Product & { id: string }) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageFile: null,
      existingImageUrl: product.image.getDirectURL(),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price) {
      toast.error("Title and price are required.");
      return;
    }

    let imageBlob: ExternalBlob;
    if (form.imageFile) {
      const bytes = new Uint8Array(await form.imageFile.arrayBuffer());
      imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
    } else if (form.existingImageUrl) {
      imageBlob = ExternalBlob.fromURL(form.existingImageUrl);
    } else {
      toast.error("Please upload an image.");
      return;
    }

    const productInput: ProductInput = {
      title: form.title,
      description: form.description,
      price: Number.parseFloat(form.price),
      category: form.category,
      image: imageBlob,
    };

    try {
      if (editingId) {
        await updateProduct.mutateAsync({
          id: editingId,
          product: productInput,
        });
        toast.success("Product updated successfully.");
      } else {
        await addProduct.mutateAsync(productInput);
        toast.success("Product added successfully.");
      }
      setDialogOpen(false);
      setUploadProgress(0);
    } catch {
      toast.error("Failed to save product.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted.");
      setDeleteConfirmId(null);
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const isSaving = addProduct.isPending || updateProduct.isPending;

  // Map products with an id
  const productList = products.map((p, i) => ({ ...p, id: `product-${i}` }));

  const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4"];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              data-ocid="admin.back.button"
              onClick={onNavigateBack}
              className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity text-primary-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="luxury-sans">Back to Store</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="font-serif text-lg tracking-widest">
              Élévation Admin
            </h1>
          </div>
          <Button
            data-ocid="admin.login.button"
            variant="outline"
            size="sm"
            onClick={handleLogin}
            disabled={loginStatus === "logging-in"}
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-none luxury-sans"
          >
            {loginStatus === "logging-in" ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Logging in...
              </>
            ) : isAuthenticated ? (
              "Logout"
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {!isAuthenticated ? (
          <div className="text-center py-24">
            <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-6" />
            <h2 className="font-serif text-3xl mb-3">Admin Access</h2>
            <p className="text-muted-foreground mb-8">
              Please log in to manage your store.
            </p>
            <Button
              data-ocid="admin.login_cta.primary_button"
              onClick={handleLogin}
              disabled={loginStatus === "logging-in"}
              className="bg-primary text-primary-foreground rounded-none luxury-sans px-10 py-6"
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging
                  in...
                </>
              ) : (
                "Login with Internet Identity"
              )}
            </Button>
          </div>
        ) : adminLoading ? (
          <div data-ocid="admin.loading_state" className="text-center py-24">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Verifying access...</p>
          </div>
        ) : !isAdmin ? (
          <div data-ocid="admin.error_state" className="text-center py-24">
            <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-6" />
            <h2 className="font-serif text-3xl mb-3">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have admin privileges to manage this store.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="luxury-sans text-muted-foreground mb-1">
                  Dashboard
                </p>
                <h2 className="font-serif text-3xl">Product Management</h2>
              </div>
              <Button
                data-ocid="admin.add_product.primary_button"
                onClick={openAdd}
                className="bg-primary text-primary-foreground rounded-none luxury-sans"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>

            {productsLoading ? (
              <div
                data-ocid="admin.table.loading_state"
                className="grid grid-cols-4 gap-4"
              >
                {SKELETON_KEYS.map((k) => (
                  <div
                    key={k}
                    className="bg-muted animate-pulse h-20 rounded"
                  />
                ))}
              </div>
            ) : productList.length === 0 ? (
              <div
                data-ocid="admin.table.empty_state"
                className="text-center py-16 border border-dashed border-border"
              >
                <p className="font-serif text-xl text-muted-foreground">
                  No products yet.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Add your first product to get started.
                </p>
              </div>
            ) : (
              <div className="border border-border" data-ocid="admin.table">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="luxury-sans">Product</TableHead>
                      <TableHead className="luxury-sans">Category</TableHead>
                      <TableHead className="luxury-sans">Price</TableHead>
                      <TableHead className="luxury-sans text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productList.map((product, i) => (
                      <TableRow
                        key={product.id}
                        data-ocid={`admin.table.item.${i + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image.getDirectURL()}
                              alt={product.title}
                              className="w-12 h-16 object-cover flex-shrink-0"
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {product.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="luxury-sans text-[10px]"
                          >
                            {CATEGORY_LABEL[product.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${product.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              data-ocid={`admin.table.edit_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(product)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              data-ocid={`admin.table.delete_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirmId(product.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="admin.product_form.dialog"
          className="max-w-lg rounded-none"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="luxury-sans text-xs">
                Title
              </Label>
              <Input
                data-ocid="admin.product_form.title.input"
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Product title"
                className="rounded-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="luxury-sans text-xs">
                Description
              </Label>
              <Textarea
                data-ocid="admin.product_form.description.textarea"
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Product description"
                className="rounded-none resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="luxury-sans text-xs">
                  Price (USD)
                </Label>
                <Input
                  data-ocid="admin.product_form.price.input"
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0.00"
                  className="rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="luxury-sans text-xs">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as CategoryId }))
                  }
                >
                  <SelectTrigger
                    data-ocid="admin.product_form.category.select"
                    className="rounded-none"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image" className="luxury-sans text-xs">
                Product Image
              </Label>
              <input
                data-ocid="admin.product_form.upload_button"
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    imageFile: e.target.files?.[0] ?? null,
                  }))
                }
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:uppercase file:tracking-wider cursor-pointer"
              />
              {form.existingImageUrl && !form.imageFile && (
                <img
                  src={form.existingImageUrl}
                  alt="Current"
                  className="mt-2 h-24 object-cover"
                />
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-muted h-1 mt-2">
                  <div
                    className="bg-secondary h-1 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.product_form.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-none luxury-sans"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.product_form.submit_button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-primary text-primary-foreground rounded-none luxury-sans"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />{" "}
                  Saving...
                </>
              ) : editingId ? (
                "Update"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(o) => !o && setDeleteConfirmId(null)}
      >
        <DialogContent
          data-ocid="admin.delete_confirm.dialog"
          className="max-w-sm rounded-none"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Delete Product?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.delete_confirm.cancel_button"
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-none luxury-sans"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.delete_confirm.confirm_button"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground rounded-none luxury-sans"
            >
              {deleteProduct.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

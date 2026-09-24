import { useCallback, useEffect, useMemo, useState } from "react";
import type { InventoryItem } from "@car-platform/api-client";
import type { Product, ProductCategory } from "@car-platform/types";
import {
  Alert,
  Button,
  Card,
  FileUpload,
  Input,
  PageHeader,
  Select,
  StatusBadge,
} from "@car-platform/ui-web";
import { AdminPageLayout } from "./components/AdminPageLayout";
import { useManagedBusiness } from "./components/useManagedBusiness";
import { catalogApi, uploadsApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";
import { fileToBase64, validateImageFile } from "../lib/files";
const emptyForm = {
  name: "",
  sku: "",
  categoryId: "",
  price: "",
  brand: "",
  initialStock: "0",
  lowStockThreshold: "5",
};

export function ProductsPage() {
  const managed = useManagedBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState(emptyForm);
  const imagePreview = useMemo(
    () =>
      imageFile
        ? URL.createObjectURL(imageFile)
        : editing?.images?.[0]?.imageUrl,
    [editing, imageFile],
  );
  useEffect(
    () => () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );
  const load = useCallback(async () => {
    if (!managed.business) return;
    setLoading(true);
    try {
      const [productData, categoryData, stockData] = await Promise.all([
        catalogApi.listForBusiness({ limit: 100 }),
        catalogApi.listCategories(),
        catalogApi.listInventory(managed.business.id),
      ]);
      setProducts(productData.items);
      setCategories(categoryData.categories);
      setInventory(stockData.items);
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not load products."));
    } finally {
      setLoading(false);
    }
  }, [managed.business]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  function open(product?: Product) {
    setEditing(product ?? null);
    setForm(
      product
        ? {
            name: product.name,
            sku: product.sku,
            categoryId: product.categoryId,
            price: product.price,
            brand: product.brand ?? "",
            initialStock: "0",
            lowStockThreshold: "5",
          }
        : emptyForm,
    );
    setShowForm(true);
    setImageFile(null);
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!managed.business) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        categoryId: form.categoryId,
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        brand: form.brand || undefined,
      };
      let savedProduct: Product;
      if (editing) {
        savedProduct = (await catalogApi.update(editing.id, payload)).product;
      } else {
        const branch =
          managed.business.branches?.find((item) => item.isPrimary) ??
          managed.business.branches?.[0];
        if (!branch) {
          throw new Error("Add a business branch before creating products.");
        }
        savedProduct = (
          await catalogApi.create({
            businessId: managed.business.id,
            ...payload,
            inventory: {
              branchId: branch.id,
              quantity: Number(form.initialStock),
              lowStockThreshold: Number(form.lowStockThreshold),
              reorderQuantity: Number(form.lowStockThreshold),
            },
          })
        ).product;
      }
      if (imageFile) {
        const uploaded = await uploadsApi.upload({
          fileName: imageFile.name,
          mimeType: imageFile.type as "image/png" | "image/jpeg",
          data: await fileToBase64(imageFile),
          purpose: "PRODUCT_IMAGE",
        });
        await catalogApi.addImage(savedProduct.id, {
          imageUrl: uploaded.fileUrl,
          altText: savedProduct.name,
          isPrimary: true,
        });
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setImageFile(null);
      setSuccess(
        editing
          ? "Product updated successfully."
          : "Product added successfully.",
      );
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not save the product."));
    } finally {
      setSaving(false);
    }
  }
  async function remove(product: Product) {
    if (!window.confirm(`Remove ${product.name}?`)) return;
    try {
      await catalogApi.remove(product.id);
      setSuccess(`${product.name} was removed.`);
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not remove the product."));
    }
  }
  return (
    <AdminPageLayout
      activeKey="products"
      business={managed.business}
      title="Products"
    >
      <PageHeader
        title="Products"
        subtitle="Automotive parts and products sold by your shop"
        action={
          <Button size="sm" disabled={!managed.business} onClick={() => open()}>
            + Add Product
          </Button>
        }
      />
      {managed.error || error ? (
        <Alert variant="error">{managed.error ?? error}</Alert>
      ) : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      {showForm ? (
        <Card className="ui-admin-service-form">
          <form onSubmit={save}>
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>
            <div className="ui-admin-form-grid">
              <div className="ui-field ui-field--wide">
                {imagePreview ? (
                  <img
                    className="ui-admin-image-preview"
                    src={imagePreview}
                    alt="Product preview"
                  />
                ) : null}
                <FileUpload
                  accept="image/png,image/jpeg"
                  label="Product image"
                  description={imageFile?.name ?? "PNG or JPG · Max 5 MB"}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (!file) return;
                    const validationError = validateImageFile(file);
                    if (validationError) {
                      setError(validationError);
                      return;
                    }
                    setError(null);
                    setImageFile(file);
                  }}
                  onRemove={imageFile ? () => setImageFile(null) : undefined}
                />
              </div>
              <Input
                label="Product name"
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
              <Input
                label="SKU"
                required
                value={form.sku}
                onChange={(event) =>
                  setForm({ ...form, sku: event.target.value })
                }
              />
              <Select
                label="Category"
                required
                value={form.categoryId}
                onChange={(event) =>
                  setForm({ ...form, categoryId: event.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Brand"
                value={form.brand}
                onChange={(event) =>
                  setForm({ ...form, brand: event.target.value })
                }
              />
              <Input
                label="Sale price (EGP)"
                type="number"
                min="0"
                required
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: event.target.value })
                }
              />
              {!editing ? (
                <>
                  <Input
                    label="Initial stock"
                    type="number"
                    min="0"
                    required
                    value={form.initialStock}
                    onChange={(event) =>
                      setForm({ ...form, initialStock: event.target.value })
                    }
                  />
                  <Input
                    label="Low-stock alert"
                    type="number"
                    min="0"
                    required
                    value={form.lowStockThreshold}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        lowStockThreshold: event.target.value,
                      })
                    }
                  />
                </>
              ) : null}
            </div>
            <div className="ui-admin-page__actions">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm(emptyForm);
                  setImageFile(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save Product
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      {loading ? <Card>Loading products…</Card> : null}
      {!loading && !products.length ? <Card>No products found.</Card> : null}
      {!loading && products.length ? (
        <div className="ui-admin-product-grid">
          {products.map((product) => {
            const stock = inventory.find(
              (item) => item.productId === product.id,
            );
            const quantity = stock?.availableQuantity ?? 0;
            return (
              <Card
                as="article"
                className="ui-admin-product-card"
                key={product.id}
              >
                <div className="ui-admin-product-card__image">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].imageUrl}
                      alt={product.images[0].altText ?? product.name}
                    />
                  ) : (
                    <span>
                      {product.brand?.slice(0, 2).toUpperCase() ?? "PR"}
                    </span>
                  )}
                </div>
                <small>{product.brand ?? product.category?.name}</small>
                <h2>{product.name}</h2>
                <p>SKU: {product.sku}</p>
                <strong>
                  {Number(product.price).toLocaleString("en-EG")}{" "}
                  {product.currency}
                </strong>
                <StatusBadge
                  status={
                    quantity === 0
                      ? "Out of Stock"
                      : stock && quantity <= stock.lowStockThreshold
                        ? "Low Stock"
                        : "In Stock"
                  }
                />
                <p>Stock: {quantity} units</p>
                <div className="ui-admin-request-card__actions">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => open(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={() => void remove(product)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </AdminPageLayout>
  );
}

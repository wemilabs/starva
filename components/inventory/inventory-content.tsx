import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import { InventoryHistoryContent } from "@/components/inventory/inventory-history-content";
import { StockAdjustment } from "@/components/inventory/stock-adjustment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FALLBACK_PRODUCT_IMG_URL } from "@/lib/constants";
import { cn, formatPriceInRWF } from "@/lib/utils";
import { getInventoryList } from "@/server/inventory";

type InventoryContentProps = {
  activeOrgId: string;
};

export async function InventoryContent({ activeOrgId }: InventoryContentProps) {
  const result = await getInventoryList({ organizationId: activeOrgId });

  if (!result.ok) {
    return (
      <div className="text-center text-red-600">
        Error loading inventory:{" "}
        {typeof result.error === "string"
          ? result.error
          : "Failed to load inventory"}
      </div>
    );
  }

  const products = result.products;
  const lowStockProducts = products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.lowStockThreshold
  );
  const outOfStockProducts = products.filter((p) => p.currentStock === 0);
  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.price) * p.currentStock,
    0
  );

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono tracking-tighter">
              Total Products
            </CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tighter">
              {products.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono tracking-tighter">
              Low Stock
            </CardTitle>
            <TrendingDown className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 font-mono tracking-tighter">
              {lowStockProducts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono tracking-tighter">
              Out of Stock
            </CardTitle>
            <TrendingDown className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 font-mono tracking-tighter">
              {outOfStockProducts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono tracking-tighter">
              Total Value
            </CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 font-mono tracking-tighter">
              {formatPriceInRWF(totalValue.toString())}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-6 border-b">
          <h2 className="text-xl font-medium">Products</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">
              No products with inventory tracking
            </p>
            <p className="text-muted-foreground mt-1">
              Enable inventory tracking when creating or editing products
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4 p-4">
              {products.map((product) => {
                const isLowStock =
                  product.currentStock <= product.lowStockThreshold;
                const isOutOfStock = product.currentStock === 0;

                return (
                  <Card key={product.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="relative size-16 rounded-md overflow-hidden shrink-0">
                          <Image
                            src={product.imageUrl ?? FALLBACK_PRODUCT_IMG_URL}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground font-mono tracking-tighter truncate">
                                {product.slug}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={cn("gap-1.5", {
                                "bg-blue-50 text-blue-700 border-blue-200":
                                  product.status === "draft",
                                "bg-green-50 text-green-700 border-green-200":
                                  product.status === "in_stock",
                                "bg-red-50 text-red-700 border-red-200":
                                  product.status === "out_of_stock",
                                "bg-gray-50 text-gray-700 border-gray-200":
                                  product.status === "archived",
                              })}
                            >
                              <span
                                className={cn("size-1.5 rounded-full", {
                                  "bg-blue-500": product.status === "draft",
                                  "bg-green-600": product.status === "in_stock",
                                  "bg-red-600":
                                    product.status === "out_of_stock",
                                  "bg-gray-600": product.status === "archived",
                                })}
                              />
                              {product.status.replace("_", " ")}
                            </Badge>

                            {isLowStock && !isOutOfStock && (
                              <Badge
                                variant="outline"
                                className="gap-1 bg-orange-50 text-orange-700 border-orange-200"
                              >
                                <AlertTriangle className="size-3" />
                                Low Stock
                              </Badge>
                            )}
                            {isOutOfStock && (
                              <Badge
                                variant="outline"
                                className="gap-1 bg-red-50 text-red-700 border-red-200"
                              >
                                <AlertTriangle className="size-3" />
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Current Stock
                          </p>
                          <p
                            className={cn("font-mono font-medium mt-0.5", {
                              "text-red-600": isOutOfStock,
                              "text-orange-600": isLowStock && !isOutOfStock,
                            })}
                          >
                            {product.currentStock}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Threshold
                          </p>
                          <p className="font-mono font-medium mt-0.5">
                            {product.lowStockThreshold}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Unit Price
                          </p>
                          <p className="font-mono font-medium mt-0.5">
                            {formatPriceInRWF(Number(product.price))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2">
                        <StockAdjustment
                          product={product}
                          organizationId={activeOrgId}
                        />
                        <InventoryHistoryContent
                          productId={product.id}
                          productName={product.name}
                          organizationId={activeOrgId}
                          inventoryHistoryButtonText="View Inventory history"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm">
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">
                      Current Stock
                    </th>
                    <th className="text-right p-4 font-medium">Threshold</th>
                    <th className="text-right p-4 font-medium">Unit Price</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isLowStock =
                      product.currentStock <= product.lowStockThreshold;
                    const isOutOfStock = product.currentStock === 0;

                    return (
                      <tr key={product.id} className="border-b last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative size-12 rounded-md overflow-hidden shrink-0">
                              <Image
                                src={
                                  product.imageUrl ?? FALLBACK_PRODUCT_IMG_URL
                                }
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium line-clamp-1">
                                  {product.name}
                                </p>
                                {isLowStock && !isOutOfStock && (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    <AlertTriangle className="size-3" />
                                    Low Stock
                                  </Badge>
                                )}
                                {isOutOfStock && (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 bg-red-50 text-red-700 border-red-200"
                                  >
                                    <AlertTriangle className="size-3" />
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground font-mono tracking-tighter">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={cn("gap-1.5", {
                              "bg-blue-50 text-blue-700 border-blue-200":
                                product.status === "draft",
                              "bg-green-50 text-green-700 border-green-200":
                                product.status === "in_stock",
                              "bg-red-50 text-red-700 border-red-200":
                                product.status === "out_of_stock",
                              "bg-gray-50 text-gray-700 border-gray-200":
                                product.status === "archived",
                            })}
                          >
                            <span
                              className={cn("size-1.5 rounded-full", {
                                "bg-blue-500": product.status === "draft",
                                "bg-green-600": product.status === "in_stock",
                                "bg-red-600": product.status === "out_of_stock",
                                "bg-gray-600": product.status === "archived",
                              })}
                            />
                            {product.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={cn("font-mono font-medium", {
                              "text-red-600": isOutOfStock,
                              "text-orange-600": isLowStock && !isOutOfStock,
                            })}
                          >
                            {product.currentStock}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-muted-foreground font-mono">
                            {product.lowStockThreshold}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono">
                          {formatPriceInRWF(Number(product.price))}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <StockAdjustment
                              product={product}
                              organizationId={activeOrgId}
                            />
                            <InventoryHistoryContent
                              productId={product.id}
                              productName={product.name}
                              organizationId={activeOrgId}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

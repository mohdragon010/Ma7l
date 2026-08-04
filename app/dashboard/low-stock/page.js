"use client";

import { AlertCircle, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import StatCard from "@/components/ui/statCard";
import LowStockTable from "@/components/ui/lowStockTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function LowStockPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getLowStockProducts = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch("/api/products");
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message ?? "تعذر تحميل المنتجات")
            
            // Filter low stock products
            const lowStock = (data.products ?? []).filter(
                p => p.stock_quantity <= p.min_stock_limit
            );
            // Sort by out of stock first, then by quantity
            lowStock.sort((a, b) => a.stock_quantity - b.stock_quantity);
            setProducts(lowStock)
        } catch (err) {
            console.log(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, []);

    useEffect(() => {
        getLowStockProducts();
    }, [getLowStockProducts]);

    const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;
    const totalLowStock = products.length;

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">
                    قائمة النواقص
                </h1>
                <p className="text-sm text-muted-foreground">
                    المنتجات التي وصلت إلى حد الطلب الأدنى أو نفدت
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    <>
                        <Skeleton className="h-30 w-full rounded-xl" />
                        <Skeleton className="h-30 w-full rounded-xl" />
                    </>
                ) : (
                    <>
                        <StatCard 
                            title="إجمالي النواقص" 
                            value={totalLowStock} 
                            icon={AlertTriangle} 
                            valueClassName="text-orange-500"
                            description="منتجات وصلت للحد الأدنى"
                        />
                        <StatCard 
                            title="أصناف نفدت تماماً" 
                            value={outOfStockCount} 
                            icon={AlertCircle} 
                            valueClassName="text-destructive"
                            description="منتجات رصيدها صفر"
                        />
                    </>
                )}
            </div>

            <div>
                {loading ? (
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-16 text-muted-foreground">
                        <Spinner />
                        <span>جارٍ تحميل النواقص...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                        <p className="text-sm text-destructive">{error}</p>
                        <Button variant="outline" size="sm" onClick={getLowStockProducts}>
                            إعادة المحاولة
                        </Button>
                    </div>
                ) : (
                    <LowStockTable products={products} />
                )}
            </div>
        </div>
    )
}

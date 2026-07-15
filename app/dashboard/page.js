"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    Coins, 
    Package, 
    Folder, 
    AlertTriangle, 
    Plus, 
    Pencil, 
    ArrowUpRight, 
    TrendingUp, 
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import StatCard from "@/components/ui/statCard";
import UpdateProductDialog from "@/components/ui/updateProductDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Import Recharts
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell 
} from "recharts";

// Restock dialog component
function RestockDialog({ open, setOpen, product, onRestocked }) {
    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setQuantity(product.stock_quantity.toString());
        }
    }, [product]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (quantity === "" || isNaN(quantity)) {
            toast.error("يرجى إدخال كمية صالحة");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetId: product._id,
                    updatedProduct: {
                        stock_quantity: Number(quantity)
                    }
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message ?? "تعذر تحديث الكمية");
            toast.success("تم تحديث الكمية بنجاح");
            onRestocked();
            setOpen(false);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>تزويد كمية المنتج</DialogTitle>
                    <DialogDescription>تعديل رصيد المخزن للمنتج: <span className="font-bold text-primary">{product?.name}</span></DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 py-4">
                    <Field>
                        <FieldLabel htmlFor="restock-qty">الكمية الجديدة في المخزن</FieldLabel>
                        <Input
                            id="restock-qty"
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </Field>
                    <DialogFooter className="gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>إلغاء</Button>
                        <Button type="submit" disabled={loading}>{loading && <Spinner />} حفظ التعديل</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Dashboard() {
    const { user, loading: userLoading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // Dialog state for full update
    const [updateOpen, setUpdateOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Dialog state for restock
    const [restockOpen, setRestockOpen] = useState(false);
    const [restockProduct, setRestockProduct] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/dashboard/stats");
            const resData = await res.json();
            if (!res.ok) throw new Error(resData?.message ?? "تعذر تحميل بيانات لوحة التحكم");
            setData(resData);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatDate = (isoString) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch {
            return "";
        }
    };

    if (userLoading || !mounted) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    const PIE_COLORS = ["#10B981", "#EF4444"];

    const stats = data?.stats ?? { totalCapital: 0, totalProducts: 0, totalCategories: 0, criticalLowStockCount: 0 };
    const categoryValues = data?.categoryValues ?? [];
    const stockStatusData = data?.stockStatusData ?? [{ name: "متوفر", value: 0 }, { name: "نواقص", value: 0 }];
    const latestProducts = data?.latestProducts ?? [];
    const criticalLowStockList = data?.criticalLowStockList ?? [];

    const totalStockItems = stockStatusData[0].value + stockStatusData[1].value;
    const healthyPercent = totalStockItems > 0 ? Math.round((stockStatusData[0].value / totalStockItems) * 100) : 0;
    const lowStockPercent = totalStockItems > 0 ? Math.round((stockStatusData[1].value / totalStockItems) * 100) : 0;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        لوحة التحكم - {user?.store_name || "متجري"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        أهلاً بك، {user?.username || "التاجر"}. إليك نظرة سريعة على أداء المحل والمخزن اليوم.
                    </p>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
                        تحديث
                    </Button>
                </div>
            </header>

            {loading ? (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Skeleton className="h-80 w-full rounded-xl" />
                        <Skeleton className="h-80 w-full rounded-xl" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Skeleton className="h-80 w-full rounded-xl" />
                        <Skeleton className="h-80 w-full rounded-xl" />
                    </div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center animate-in zoom-in duration-300">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                        إعادة المحاولة
                    </Button>
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                            <StatCard 
                                title="رأس مال المخزن (سعر الشراء)" 
                                value={`${stats.totalCapital.toLocaleString()} ج.م`} 
                                icon={Coins} 
                                valueClassName="text-emerald-500 font-extrabold text-2xl"
                                description="إجمالي قيمة المنتجات الحالية"
                            />
                        </div>
                        <div className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                            <StatCard 
                                title="إجمالي الأصناف" 
                                value={stats.totalProducts} 
                                icon={Package} 
                                valueClassName="text-indigo-500 font-extrabold text-2xl"
                                description="عدد المنتجات المسجلة بالمحل"
                            />
                        </div>
                        <div className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                            <StatCard 
                                title="عدد الأقسام" 
                                value={stats.totalCategories} 
                                icon={Folder} 
                                valueClassName="text-violet-500 font-extrabold text-2xl"
                                description="تصنيفات المنتجات المتاحة"
                            />
                        </div>
                        <div className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                            <StatCard 
                                title="النواقص الحرجة" 
                                value={stats.criticalLowStockCount} 
                                icon={AlertTriangle} 
                                valueClassName={`${stats.criticalLowStockCount > 0 ? "text-rose-500 animate-pulse" : "text-muted-foreground"} font-extrabold text-2xl`}
                                description="منتجات نفدت أو قاربت على النفاد"
                            />
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Bar Chart - Category Value */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <span>قيمة البضاعة حسب القسم</span>
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                </CardTitle>
                                <CardDescription>إجمالي قيمة رأس المال المستثمر في كل تصنيف</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {categoryValues.length === 0 ? (
                                    <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                                        لا توجد بضائع مصنفة لعرضها
                                    </div>
                                ) : (
                                    <div className="h-[300px] w-full" dir="ltr">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={categoryValues} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                                                <Tooltip 
                                                    formatter={(value) => [`${value.toLocaleString()} ج.م`, "قيمة البضاعة"]}
                                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", textAlign: "right" }}
                                                />
                                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pie Chart - Stock Status */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">نسبة توافر المنتجات</CardTitle>
                                <CardDescription>مقارنة البضائع المتوفرة بالنواقص الحرجة</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                {totalStockItems === 0 ? (
                                    <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                                        لا توجد بيانات كافية
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-[240px] w-full relative" dir="ltr">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={stockStatusData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {stockStatusData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        formatter={(value) => [value, "عدد الأصناف"]}
                                                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-3xl font-extrabold">{healthyPercent}%</span>
                                                <span className="text-xs text-muted-foreground font-medium">متوفر</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-center gap-6 mt-2 w-full">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                                                <span className="text-xs font-semibold text-muted-foreground">متوفر ({stockStatusData[0].value} صنف)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                                                <span className="text-xs font-semibold text-muted-foreground">نواقص ({stockStatusData[1].value} صنف)</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Views / Tables Section */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Right: Latest 5 products added */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-semibold">آخر 5 منتجات مضافة</CardTitle>
                                    <CardDescription>المنتجات التي تم تسجيلها مؤخراً في النظام</CardDescription>
                                </div>
                                <Link href="/dashboard/products" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                                    عرض الكل
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {latestProducts.length === 0 ? (
                                    <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                                        لا توجد منتجات مضافة بعد.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-right">
                                            <thead>
                                                <tr className="border-b border-border text-muted-foreground text-xs font-medium pb-2">
                                                    <th className="py-2 font-medium">المنتج</th>
                                                    <th className="py-2 font-medium">تاريخ الإضافة</th>
                                                    <th className="py-2 font-medium">الكمية والسعر</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {latestProducts.map((p) => (
                                                    <tr key={p._id} className="group hover:bg-muted/30 transition-colors">
                                                        <td className="py-3 flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-md border border-border bg-muted/50 overflow-hidden shrink-0 flex items-center justify-center">
                                                                {p.image ? (
                                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-foreground max-w-[150px] truncate">{p.name}</span>
                                                        </td>
                                                        <td className="py-3 text-muted-foreground text-xs">{formatDate(p.createdAt)}</td>
                                                        <td className="py-3 font-medium text-foreground">
                                                            <div className="flex flex-col">
                                                                <span>{p.sell_price} ج.م</span>
                                                                <span className="text-[10px] text-muted-foreground">الرصيد: {p.stock_quantity}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Left: Top 5 critical low stock products */}
                        <Card className="hover:shadow-md transition-shadow border-rose-500/20">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-semibold text-rose-600 flex items-center gap-1.5">
                                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                                        أخطر 5 نواقص بحاجة للمون
                                    </CardTitle>
                                    <CardDescription>المنتجات التي نفدت أو قاربت على النفاد تماماً</CardDescription>
                                </div>
                                <Link href="/dashboard/low-stock" className="text-xs text-rose-600 hover:underline flex items-center gap-0.5">
                                    كل النواقص
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {criticalLowStockList.length === 0 ? (
                                    <div className="flex h-48 items-center justify-center text-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg border border-emerald-500/10 text-sm font-medium">
                                        ممتاز! لا توجد منتجات منخفضة المخزن حالياً.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-right">
                                            <thead>
                                                <tr className="border-b border-border text-muted-foreground text-xs font-medium pb-2">
                                                    <th className="py-2 font-medium">المنتج</th>
                                                    <th className="py-2 font-medium">الرصيد الحالي</th>
                                                    <th className="py-2 font-medium text-center">تأمين الرصيد</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {criticalLowStockList.map((p) => (
                                                    <tr key={p._id} className="group hover:bg-muted/30 transition-colors">
                                                        <td className="py-3 flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-md border border-border bg-muted/50 overflow-hidden shrink-0 flex items-center justify-center">
                                                                {p.image ? (
                                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-foreground max-w-[150px] truncate">{p.name}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="flex flex-col">
                                                                <span className={`font-bold ${p.stock_quantity === 0 ? "text-rose-600" : "text-amber-600"}`}>
                                                                    {p.stock_quantity === 0 ? "نفد تماماً" : `${p.stock_quantity} قطع`}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground">الحد الأدنى: {p.min_stock_limit}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="h-7 px-2 text-xs border-primary text-primary hover:bg-primary/5"
                                                                    onClick={() => {
                                                                        setRestockProduct(p);
                                                                        setRestockOpen(true);
                                                                    }}
                                                                >
                                                                    تزويد الكمية
                                                                </Button>
                                                                <Button 
                                                                    size="icon-sm" 
                                                                    variant="ghost" 
                                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                    onClick={() => {
                                                                        setSelectedProduct(p);
                                                                        setUpdateOpen(true);
                                                                    }}
                                                                    aria-label="تعديل كامل"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Modals/Dialogs */}
            <RestockDialog 
                open={restockOpen} 
                setOpen={setRestockOpen} 
                product={restockProduct} 
                onRestocked={fetchDashboardData} 
            />

            <UpdateProductDialog 
                open={updateOpen} 
                setOpen={setUpdateOpen} 
                product={selectedProduct} 
                onUpdated={fetchDashboardData} 
            />
        </div>
    );
}
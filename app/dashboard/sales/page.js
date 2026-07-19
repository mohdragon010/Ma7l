"use client";

import { useEffect, useState } from "react";
import { Banknote, Receipt, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import StatCard from "@/components/ui/statCard";
import SalesTable from "./components/SalesTable";
import { Button } from "@/components/ui/button";

export default function SalesPage() {
    const { user, loading: userLoading } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSales = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/sales");
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "فشل في جلب المبيعات");
            setSales(data.sales || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    if (userLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    // Calculate totals
    const totalSalesAmount = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalProfit = sales.reduce((acc, sale) => acc + sale.profit, 0);
    const totalInvoices = sales.length;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">سجل المبيعات</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        تابع مبيعاتك، فواتيرك، وصافي أرباحك في مكان واحد
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSales} disabled={loading}>
                    {loading ? <Spinner className="h-4 w-4 ml-2" /> : null}
                    تحديث البيانات
                </Button>
            </header>

            {loading && sales.length === 0 ? (
                <div className="flex justify-center items-center h-48">
                    <Spinner className="h-8 w-8 text-primary" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchSales}>
                        إعادة المحاولة
                    </Button>
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                        <StatCard 
                            title="إجمالي المبيعات" 
                            value={`${totalSalesAmount.toLocaleString()} ج.م`} 
                            icon={Banknote} 
                            valueClassName="text-primary font-extrabold text-2xl"
                            description="قيمة الفواتير بعد الخصومات"
                        />
                        <StatCard 
                            title="صافي الأرباح" 
                            value={`${totalProfit.toLocaleString()} ج.م`} 
                            icon={TrendingUp} 
                            valueClassName="text-emerald-600 font-extrabold text-2xl"
                            description="الربح من المبيعات المسجلة"
                        />
                        <StatCard 
                            title="إجمالي الفواتير" 
                            value={totalInvoices.toString()} 
                            icon={Receipt} 
                            valueClassName="text-foreground font-extrabold text-2xl"
                            description="عدد عمليات البيع"
                        />
                    </div>

                    {/* Sales Table */}
                    <div className="mt-2">
                        <SalesTable sales={sales} />
                    </div>
                </>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { Receipt, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SaleDetailsDialog from "./SaleDetailsDialog";

export default function SalesTable({ sales }) {
    const [selectedSale, setSelectedSale] = useState(null);

    if (!sales || sales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
                <div className="rounded-full bg-muted p-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">لا توجد مبيعات مسجلة</p>
                    <p className="text-xs text-muted-foreground mt-1">ابدأ ببيع المنتجات من نقطة البيع لترى سجل فواتيرك هنا</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <Table dir="rtl">
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="text-right whitespace-nowrap">التاريخ والوقت</TableHead>
                            <TableHead className="text-center whitespace-nowrap">عدد الأصناف</TableHead>
                            <TableHead className="text-center whitespace-nowrap">الخصم</TableHead>
                            <TableHead className="text-center whitespace-nowrap">الإجمالي</TableHead>
                            <TableHead className="text-center whitespace-nowrap">صافي الربح</TableHead>
                            <TableHead className="text-center w-20">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.map((sale) => {
                            const date = new Date(sale.createdAt);
                            const discountVal = sale.discountType === 'percent' 
                                ? (sale.subtotal * sale.discount / 100)
                                : sale.discount;
                                
                            return (
                                <TableRow key={sale._id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSale(sale)}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span>{date.toLocaleDateString("ar-EG")}</span>
                                            <span className="text-xs text-muted-foreground">{date.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center tabular-nums">
                                        <Badge variant="outline" className="bg-background">
                                            {sale.items.length} أصناف
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center tabular-nums text-destructive">
                                        {discountVal > 0 ? `-${discountVal.toLocaleString()} ج.م` : "-"}
                                    </TableCell>
                                    <TableCell className="text-center tabular-nums font-bold text-primary">
                                        {sale.total.toLocaleString()} ج.م
                                    </TableCell>
                                    <TableCell className="text-center tabular-nums font-bold text-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/10">
                                        {sale.profit.toLocaleString()} ج.م
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-primary hover:bg-primary/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSale(sale);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 ml-1" />
                                            عرض
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <SaleDetailsDialog 
                open={!!selectedSale} 
                onOpenChange={(open) => !open && setSelectedSale(null)}
                sale={selectedSale}
            />
        </>
    );
}

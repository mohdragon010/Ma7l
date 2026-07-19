"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SaleDetailsDialog({ open, onOpenChange, sale }) {
    if (!sale) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle>تفاصيل الفاتورة</DialogTitle>
                    <DialogDescription>
                        تاريخ الفاتورة: {new Date(sale.createdAt).toLocaleString("ar-EG", {
                            year: "numeric", month: "long", day: "numeric",
                            hour: "2-digit", minute: "2-digit"
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-x-auto my-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">المنتج</TableHead>
                                <TableHead className="text-center">الكمية</TableHead>
                                <TableHead className="text-center">السعر</TableHead>
                                <TableHead className="text-center">الإجمالي</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sale.items.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-center tabular-nums">{item.quantity}</TableCell>
                                    <TableCell className="text-center tabular-nums">{item.sell_price.toLocaleString()} ج.م</TableCell>
                                    <TableCell className="text-center tabular-nums">{(item.sell_price * item.quantity).toLocaleString()} ج.م</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">المجموع الفرعي:</span>
                        <span className="font-medium tabular-nums">{sale.subtotal.toLocaleString()} ج.م</span>
                    </div>
                    {sale.discount > 0 && (
                        <div className="flex justify-between text-destructive">
                            <span>الخصم ({sale.discountType === 'percent' ? '%' : 'ج.م'}):</span>
                            <span className="font-medium tabular-nums">- {sale.discountType === 'percent' ? (sale.subtotal * sale.discount / 100).toLocaleString() : sale.discount.toLocaleString()} ج.م</span>
                        </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg text-primary">
                        <span>الإجمالي النهائي:</span>
                        <span className="tabular-nums">{sale.total.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="text-muted-foreground">المدفوع:</span>
                        <span className="font-medium tabular-nums text-emerald-600">{sale.paid.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">الفكة (المتبقي):</span>
                        <span className="font-medium tabular-nums text-emerald-600">{sale.change >= 0 ? sale.change.toLocaleString() : `عجز ${Math.abs(sale.change).toLocaleString()}`} ج.م</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-500/10 p-2 rounded">
                        <span>صافي الربح:</span>
                        <span className="tabular-nums">{sale.profit.toLocaleString()} ج.م</span>
                    </div>
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        إغلاق
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

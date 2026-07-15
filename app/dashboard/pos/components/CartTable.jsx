"use client";

import { Minus, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function QuantityControl({ value, min, max, onChange }) {
    return (
        <div className="flex items-center gap-1">
            <Button
                type="button"
                size="icon-xs"
                variant="outline"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={value <= min}
                aria-label="تقليل الكمية"
            >
                <Minus className="h-3 w-3" />
            </Button>
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
                }}
                className="w-12 h-6 text-center text-sm font-semibold rounded border border-border bg-background tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="الكمية"
            />
            <Button
                type="button"
                size="icon-xs"
                variant="outline"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                aria-label="زيادة الكمية"
            >
                <Plus className="h-3 w-3" />
            </Button>
        </div>
    );
}

export default function CartTable({ cart, onQuantityChange, onRemove }) {
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 py-16 text-center">
                <div className="rounded-full bg-muted p-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">الفاتورة فارغة</p>
                    <p className="text-xs text-muted-foreground mt-0.5">امسح باركود أو ابحث عن منتج للبدء</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full text-sm" dir="rtl">
                <thead>
                    <tr className="border-b border-border bg-muted/40">
                        <th className="py-2.5 px-3 text-start text-xs font-semibold text-muted-foreground">المنتج</th>
                        <th className="py-2.5 px-3 text-center text-xs font-semibold text-muted-foreground whitespace-nowrap">سعر الوحدة</th>
                        <th className="py-2.5 px-3 text-center text-xs font-semibold text-muted-foreground">الكمية</th>
                        <th className="py-2.5 px-3 text-center text-xs font-semibold text-muted-foreground whitespace-nowrap">الإجمالي</th>
                        <th className="py-2.5 px-3 w-10" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                    {cart.map((item, idx) => {
                        const itemTotal = Number(item.sell_price) * item.quantity;
                        return (
                            <tr
                                key={item._id}
                                className={cn(
                                    "transition-colors hover:bg-muted/30",
                                    idx % 2 === 0 ? "" : "bg-muted/10"
                                )}
                            >
                                {/* Product */}
                                <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-md border border-border bg-muted/50 overflow-hidden shrink-0 flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <span className="font-medium truncate max-w-[140px]" title={item.name}>
                                            {item.name}
                                        </span>
                                    </div>
                                </td>

                                {/* Unit Price */}
                                <td className="py-2.5 px-3 text-center tabular-nums font-medium">
                                    {Number(item.sell_price).toLocaleString()}
                                    <span className="text-xs text-muted-foreground mr-0.5">ج.م</span>
                                </td>

                                {/* Quantity */}
                                <td className="py-2.5 px-3">
                                    <div className="flex justify-center">
                                        <QuantityControl
                                            value={item.quantity}
                                            min={1}
                                            max={item.stock_quantity}
                                            onChange={(v) => {
                                                if (v < 1) onRemove(item._id);
                                                else onQuantityChange(item._id, v);
                                            }}
                                        />
                                    </div>
                                </td>

                                {/* Subtotal */}
                                <td className="py-2.5 px-3 text-center">
                                    <span className="font-bold text-primary tabular-nums">
                                        {itemTotal.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground mr-0.5">ج.م</span>
                                </td>

                                {/* Remove */}
                                <td className="py-2.5 px-3">
                                    <Button
                                        type="button"
                                        size="icon-xs"
                                        variant="ghost"
                                        onClick={() => onRemove(item._id)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        aria-label={`حذف ${item.name}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

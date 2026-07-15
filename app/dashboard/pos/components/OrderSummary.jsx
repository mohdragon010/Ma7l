"use client";

import { ShoppingCart, Percent, Banknote, ReceiptText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function SummaryRow({ label, value, className, valueClassName }) {
    return (
        <div className={cn("flex items-center justify-between text-sm py-1", className)}>
            <span className="text-muted-foreground">{label}</span>
            <span className={cn("font-semibold tabular-nums", valueClassName)}>{value}</span>
        </div>
    );
}

export default function OrderSummary({
    cart,
    subtotal,
    discount,
    discountType,
    discountAmount,
    total,
    paid,
    change,
    onDiscountChange,
    onDiscountTypeToggle,
    onPaidChange,
    onClearCart,
    onConfirm,
    confirming,
}) {
    const itemCount = cart.reduce((acc, i) => acc + i.quantity, 0);
    const isEmpty = cart.length === 0;

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-xs p-4 sticky top-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-1.5">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold">الفاتورة</h2>
                        <p className="text-[11px] text-muted-foreground">{itemCount} صنف</p>
                    </div>
                </div>
                {!isEmpty && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={onClearCart}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label="مسح الفاتورة"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <Separator />

            {/* Discount */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Percent className="h-3 w-3" /> الخصم
                </label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => onDiscountChange(e.target.value)}
                        placeholder="0"
                        className="h-8 text-sm"
                        disabled={isEmpty}
                    />
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onDiscountTypeToggle}
                        className="h-8 px-3 shrink-0 text-xs font-bold"
                        disabled={isEmpty}
                    >
                        {discountType === "percent" ? "%" : "ج.م"}
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Calculations */}
            <div className="space-y-0.5">
                <SummaryRow
                    label="المجموع الفرعي"
                    value={`${subtotal.toLocaleString()} ج.م`}
                />
                {discountAmount > 0 && (
                    <SummaryRow
                        label={`خصم ${discountType === "percent" ? `(${discount}%)` : ""}`}
                        value={`- ${discountAmount.toLocaleString()} ج.م`}
                        valueClassName="text-destructive"
                    />
                )}
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <ReceiptText className="h-4 w-4" />
                    الإجمالي
                </span>
                <span className="text-xl font-extrabold text-primary tabular-nums">
                    {total.toLocaleString()} <span className="text-sm font-bold">ج.م</span>
                </span>
            </div>

            {/* Payment */}
            <div className="space-y-2">
                <label htmlFor="paid-amount" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Banknote className="h-3 w-3" /> المبلغ المدفوع
                </label>
                <Input
                    id="paid-amount"
                    type="number"
                    min="0"
                    value={paid}
                    onChange={(e) => onPaidChange(e.target.value)}
                    placeholder={`${total}`}
                    className="h-9 text-base font-semibold"
                    disabled={isEmpty}
                />
            </div>

            {/* Change */}
            <div className={cn(
                "rounded-lg px-3 py-2 flex items-center justify-between transition-all duration-300",
                change >= 0 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-destructive/10 border border-destructive/20"
            )}>
                <span className="text-xs font-semibold text-muted-foreground">المتبقي (الفكة)</span>
                <span className={cn(
                    "text-lg font-extrabold tabular-nums",
                    change >= 0 ? "text-emerald-600" : "text-destructive"
                )}>
                    {change >= 0 ? change.toLocaleString() : `عجز ${Math.abs(change).toLocaleString()}`}
                    <span className="text-xs font-bold mr-1">ج.م</span>
                </span>
            </div>

            {/* Confirm Button */}
            <Button
                type="button"
                onClick={onConfirm}
                disabled={isEmpty || confirming || Number(paid) < total}
                className="w-full h-12 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
                {confirming ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        جاري التأكيد...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <ReceiptText className="h-5 w-5" />
                        تأكيد البيع وطباعة الفاتورة
                    </span>
                )}
            </Button>

            {Number(paid) > 0 && Number(paid) < total && (
                <p className="text-xs text-center text-destructive font-medium">
                    المبلغ المدفوع أقل من الإجمالي بـ {(total - Number(paid)).toLocaleString()} ج.م
                </p>
            )}
        </div>
    );
}

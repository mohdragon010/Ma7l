"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import BarcodeInput from "./components/BarcodeInput";
import ProductSearch from "./components/ProductSearch";
import CartTable from "./components/CartTable";
import OrderSummary from "./components/OrderSummary";
import PrintReceiptDialog from "./components/PrintReceiptDialog";

// Beep sound encoded as base64 (short 440Hz tone, ~0.1s)
// We play this on every successful scan
const BEEP_B64 = "data:audio/wav;base64,UklGRl9vT2BXQVZFZm10IBAAAA" +
    "EAAQARAAABAAIABAAD4AEABmAHQAmgDAAOQA8gD6AP4A/AD2A+ED" +
    "ygOrA4YDXAMsA/QCuQJ5AjcC8gGtAWkBJgHkAKUAaAAvAPv/y/+f" +
    "/3f/U/8z/xb//v7r/tv+0P7J/sf+yv7S/t3+7f4A/xf/Mf9O/27/" +
    "kP+1/tz/BAAAAA==";

function playBeep() {
    try {
        const audio = new Audio(BEEP_B64);
        audio.volume = 0.35;
        audio.play().catch(() => {}); // silently fail if browser blocks autoplay
    } catch { /* no audio context */ }
}

export default function POSPage() {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState("");
    const [discountType, setDiscountType] = useState("fixed"); // "fixed" | "percent"
    const [paid, setPaid] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saleSummary, setSaleSummary] = useState(null);

    // ── Cart Logic ──────────────────────────────────────────────
    const addToCart = useCallback((product) => {
        if (product.stock_quantity <= 0) {
            toast.error(`"${product.name}" نفد من المخزون تماماً`);
            return;
        }
        setCart((prev) => {
            const idx = prev.findIndex((i) => i._id === product._id);
            if (idx > -1) {
                if (prev[idx].quantity >= product.stock_quantity) {
                    toast.error(`وصلت للحد الأقصى المتاح من "${product.name}" (${product.stock_quantity})`);
                    return prev;
                }
                const next = [...prev];
                next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
                return next;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        playBeep();
        toast.success(`تمت إضافة "${product.name}"`, { duration: 1200 });
    }, []);

    const handleBarcodeScanned = useCallback(async (code) => {
        if (!code) return;
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(code)}`);
            const data = await res.json();
            const products = data.products ?? [];
            // Exact barcode match
            const match = products.find((p) => p.barcode === code) ?? products[0];
            if (match) {
                addToCart(match);
            } else {
                toast.warning(`لم يُعثر على منتج بالباركود: ${code}`);
            }
        } catch {
            toast.error("خطأ في البحث عن المنتج");
        }
    }, [addToCart]);

    const handleQuantityChange = useCallback((id, qty) => {
        setCart((prev) => prev.map((i) => i._id === id ? { ...i, quantity: qty } : i));
    }, []);

    const handleRemove = useCallback((id) => {
        setCart((prev) => prev.filter((i) => i._id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setDiscount("");
        setPaid("");
    }, []);

    // ── Derived Values ───────────────────────────────────────────
    const subtotal = cart.reduce((s, i) => s + Number(i.sell_price) * i.quantity, 0);
    const discountNum = Number(discount) || 0;
    const discountAmount = discountType === "percent"
        ? Math.min(subtotal, (subtotal * discountNum) / 100)
        : Math.min(subtotal, discountNum);
    const total = Math.max(0, subtotal - discountAmount);
    const paidNum = Number(paid) || 0;
    const change = paidNum - total;

    // ── Confirm Sale ─────────────────────────────────────────────
    const handleConfirm = async () => {
        if (cart.length === 0) return;
        setConfirming(true);
        try {
            const payload = {
                items: cart,
                subtotal,
                discount: discountNum,
                discountType,
                total,
                paid: paidNum,
            };
            const res = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message ?? "تعذر تأكيد البيع");

            // Snapshot for the receipt THEN clear immediately — seller sees empty
            // cart right away so there's zero risk of a double-sale click
            setSaleSummary({
                items: cart,
                subtotal,
                discountAmount,
                total,
                paid: paidNum,
                change,
                createdAt: new Date().toISOString(),
            });
            clearCart();       // ← reset cart/discount/paid instantly
            setDialogOpen(true);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setConfirming(false);
        }
    };

    // Called by dialog on auto-close OR manual "فاتورة جديدة" click
    const handleNewSale = () => {
        setDialogOpen(false);
        setSaleSummary(null);
        // Cart is already empty — nothing else needed
    };

    return (
        <div className="flex flex-col gap-4 min-h-0" dir="rtl">
            {/* Page header */}
            <header>
                <h1 className="text-xl font-bold tracking-tight">نقطة البيع (POS)</h1>
                <p className="text-xs text-muted-foreground mt-0.5">امسح الباركود أو ابحث عن المنتج لإضافته للفاتورة</p>
            </header>

            {/* Main layout: 70 / 30 */}
            <div className="flex gap-4 items-start">
                {/* ── Left: Cart & Scanner (70%) ── */}
                <div className="flex flex-col gap-3 min-w-0 flex-7">
                    <BarcodeInput onBarcode={handleBarcodeScanned} />
                    <ProductSearch onSelect={addToCart} />
                    <CartTable
                        cart={cart}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemove}
                    />
                </div>

                {/* ── Right: Order Summary (30%) ── */}
                <div className="flex-3 min-w-[260px] max-w-sm">
                    <OrderSummary
                        cart={cart}
                        subtotal={subtotal}
                        discount={discount}
                        discountType={discountType}
                        discountAmount={discountAmount}
                        total={total}
                        paid={paid}
                        change={change}
                        onDiscountChange={setDiscount}
                        onDiscountTypeToggle={() => setDiscountType((t) => t === "fixed" ? "percent" : "fixed")}
                        onPaidChange={setPaid}
                        onClearCart={clearCart}
                        onConfirm={handleConfirm}
                        confirming={confirming}
                    />
                </div>
            </div>

            {/* Print Receipt Dialog */}
            <PrintReceiptDialog
                open={dialogOpen}
                setOpen={setDialogOpen}
                sale={saleSummary}
                storeName={user?.store_name ?? "المتجر"}
                onNewSale={handleNewSale}
            />
        </div>
    );
}

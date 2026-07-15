"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle } from "lucide-react";

const AUTO_CLOSE_MS = 5000; // auto-close + clear after 5 seconds

function PrintableReceipt({ sale, storeName }) {
    const { items, subtotal, discountAmount, total, paid, change, createdAt } = sale;
    const dateStr = createdAt
        ? new Date(createdAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })
        : "";

    return (
        <div id="printable-receipt" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", width: "280px", margin: "0 auto", direction: "rtl" }}>
            <div style={{ textAlign: "center", paddingBottom: "8px", borderBottom: "1px dashed #ccc" }}>
                <p style={{ fontWeight: 900, fontSize: "16px", margin: "0 0 4px" }}>{storeName}</p>
                <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>فاتورة مبيعات</p>
                <p style={{ fontSize: "10px", color: "#999", margin: "4px 0 0" }}>{dateStr}</p>
            </div>

            <table style={{ width: "100%", margin: "10px 0", fontSize: "12px", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                        <th style={{ textAlign: "right", fontWeight: 600, paddingBottom: "4px" }}>الصنف</th>
                        <th style={{ textAlign: "center", fontWeight: 600, paddingBottom: "4px" }}>ك</th>
                        <th style={{ textAlign: "center", fontWeight: 600, paddingBottom: "4px" }}>سعر</th>
                        <th style={{ textAlign: "left", fontWeight: 600, paddingBottom: "4px" }}>إجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                            <td style={{ padding: "4px 0", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</td>
                            <td style={{ textAlign: "center", padding: "4px 0" }}>{item.quantity}</td>
                            <td style={{ textAlign: "center", padding: "4px 0" }}>{Number(item.sell_price).toLocaleString()}</td>
                            <td style={{ textAlign: "left", padding: "4px 0", fontWeight: 600 }}>{(Number(item.sell_price) * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ borderTop: "1px dashed #ccc", paddingTop: "8px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>المجموع الفرعي</span>
                    <span>{subtotal?.toLocaleString()} ج.م</span>
                </div>
                {discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#e00", marginBottom: "4px" }}>
                        <span>الخصم</span>
                        <span>- {discountAmount?.toLocaleString()} ج.م</span>
                    </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: "14px", borderTop: "1px solid #333", paddingTop: "6px", marginTop: "4px" }}>
                    <span>الإجمالي</span>
                    <span>{total?.toLocaleString()} ج.م</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span>المدفوع</span>
                    <span>{paid?.toLocaleString()} ج.م</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#059669" }}>
                    <span>الفكة</span>
                    <span>{change?.toLocaleString()} ج.م</span>
                </div>
            </div>

            <div style={{ textAlign: "center", borderTop: "1px dashed #ccc", marginTop: "10px", paddingTop: "8px" }}>
                <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>شكراً لتسوقكم معنا 🌿</p>
            </div>
        </div>
    );
}

export default function PrintReceiptDialog({ open, setOpen, sale, storeName, onNewSale }) {
    const [secondsLeft, setSecondsLeft] = useState(Math.floor(AUTO_CLOSE_MS / 1000));
    const timerRef = useRef(null);
    const countdownRef = useRef(null);

    // Auto-close countdown when dialog opens
    useEffect(() => {
        if (!open) {
            clearTimeout(timerRef.current);
            clearInterval(countdownRef.current);
            setSecondsLeft(Math.floor(AUTO_CLOSE_MS / 1000));
            return;
        }

        setSecondsLeft(Math.floor(AUTO_CLOSE_MS / 1000));

        // Countdown tick every second
        countdownRef.current = setInterval(() => {
            setSecondsLeft((s) => Math.max(0, s - 1));
        }, 1000);

        // Auto-close after AUTO_CLOSE_MS
        timerRef.current = setTimeout(() => {
            clearInterval(countdownRef.current);
            setOpen(false);
            onNewSale?.();
        }, AUTO_CLOSE_MS);

        return () => {
            clearTimeout(timerRef.current);
            clearInterval(countdownRef.current);
        };
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePrint = () => {
        clearTimeout(timerRef.current);
        clearInterval(countdownRef.current);

        const printContents = document.getElementById("printable-receipt")?.innerHTML;
        if (!printContents) return;

        const win = window.open("", "_blank", "width=400,height=600");
        win.document.write(`
            <html dir="rtl">
            <head>
                <title>فاتورة</title>
                <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;900&display=swap" rel="stylesheet">
                <style>
                    @page { size: 80mm auto; margin: 4mm; }
                    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; }
                </style>
            </head>
            <body>${printContents}</body>
            </html>
        `);
        win.document.close();
        win.onload = () => { win.focus(); win.print(); win.close(); };

        // Close dialog and reset after print
        setTimeout(() => { setOpen(false); onNewSale?.(); }, 300);
    };

    const handleClose = () => {
        clearTimeout(timerRef.current);
        clearInterval(countdownRef.current);
        setOpen(false);
        onNewSale?.();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="sm:max-w-xs" dir="rtl" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle className="h-5 w-5" />
                        تم تأكيد البيع بنجاح!
                    </DialogTitle>
                </DialogHeader>

                {/* Countdown bar */}
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all ease-linear"
                        style={{
                            width: `${(secondsLeft / (AUTO_CLOSE_MS / 1000)) * 100}%`,
                            transitionDuration: "1s",
                        }}
                    />
                </div>
                <p className="text-[11px] text-center text-muted-foreground -mt-1">
                    يُغلق تلقائياً خلال {secondsLeft} ثانية
                </p>

                {/* Receipt Preview */}
                <div className="overflow-auto max-h-[55vh] rounded-lg border border-border bg-white p-3 shadow-inner">
                    {sale && <PrintableReceipt sale={sale} storeName={storeName} />}
                </div>

                <DialogFooter className="gap-2 flex-col sm:flex-row" dir="rtl">
                    <Button type="button" onClick={handlePrint} className="flex-1 bg-primary hover:bg-primary/90">
                        <Printer className="h-4 w-4 ml-2" />
                        طباعة الفاتورة
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                        فاتورة جديدة
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

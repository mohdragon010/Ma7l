"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SCANNER_ID = "pos-barcode-scanner";

/**
 * BarcodeInput - matches the same pattern as create/edit dialogs:
 *   • A visible text input for manual barcode entry (Enter to submit)
 *   • A camera button that toggles the Html5Qrcode live scanner
 */
export default function BarcodeInput({ onBarcode, disabled }) {
    const [value, setValue] = useState("");
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    // ── Camera scanner lifecycle (identical to create/edit dialog) ──
    useEffect(() => {
        if (!scanning) return;

        if (typeof window !== "undefined" && !window.isSecureContext) {
            setError("الكاميرا تتطلب اتصال آمن (HTTPS)");
            setScanning(false);
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            setError("المتصفح لا يدعم الوصول إلى الكاميرا");
            setScanning(false);
            return;
        }

        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        const starting = scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 150 } },
            (decoded) => {
                setScanning(false);
                onBarcode(decoded);
            },
            () => { }
        ).catch((err) => {
            const name = err?.name || "";
            const msg = name === "NotAllowedError" ? "تم رفض إذن الكاميرا"
                : name === "NotFoundError" ? "لم يتم العثور على كاميرا"
                    : `تعذر فتح الكاميرا: ${err?.message || name || "خطأ غير معروف"}`;
            setError(msg);
            setScanning(false);
        });

        return () => {
            scannerRef.current = null;
            starting
                .then(() => scanner.stop())
                .then(() => scanner.clear())
                .catch(() => { });
        };
    }, [scanning, onBarcode]);

    // ── Manual input handling ──
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const code = value.trim();
            if (code) {
                onBarcode(code);
                setValue("");
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Input row */}
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                <ScanLine className="h-5 w-5 text-primary shrink-0 animate-pulse" />
                <Input
                    id="pos-barcode-input"
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="امسح الباركود أو اكتبه يدوياً ثم Enter..."
                    disabled={disabled || scanning}
                    autoComplete="off"
                    className="flex-1 h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 text-sm"
                    aria-label="حقل الباركود"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => { setError(null); setScanning((s) => !s); }}
                    disabled={disabled}
                    aria-label={scanning ? "إيقاف الكاميرا" : "مسح بالكاميرا"}
                    className="shrink-0 h-8 w-8"
                >
                    {scanning ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                </Button>
            </div>

            {/* Camera viewfinder */}
            {scanning && (
                <div
                    id={SCANNER_ID}
                    className="w-full min-h-56 overflow-hidden rounded-lg border border-border bg-black"
                />
            )}

            {/* Error message */}
            {error && (
                <p className="text-xs text-destructive px-1">{error}</p>
            )}
        </div>
    );
}

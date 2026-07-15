"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Package, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function ProductSearch({ onSelect, disabled }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); setOpen(false); return; }
        setLoading(true);
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (res.ok) {
                setResults(data.products ?? []);
                setOpen(true);
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!query.trim()) { setResults([]); setOpen(false); return; }
        debounceRef.current = setTimeout(() => search(query), 280);
        return () => clearTimeout(debounceRef.current);
    }, [query, search]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (!containerRef.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (product) => {
        onSelect(product);
        setQuery("");
        setResults([]);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 inset-e-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    id="pos-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو الوصف..."
                    className="pe-9"
                    disabled={disabled}
                    autoComplete="off"
                    onFocus={() => results.length > 0 && setOpen(true)}
                />
                {loading && (
                    <Spinner className="absolute top-1/2 inset-s-3 -translate-y-1/2 h-4 w-4" />
                )}
                {query && (
                    <button
                        onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
                        className="absolute top-1/2 inset-s-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="مسح البحث"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown results */}
            {open && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-150">
                    {results.map((product) => (
                        <button
                            key={product._id}
                            onClick={() => handleSelect(product)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-start hover:bg-muted/60 transition-colors border-b border-border last:border-0"
                        >
                            <div className="w-9 h-9 rounded-md border border-border bg-muted/50 overflow-hidden shrink-0 flex items-center justify-center">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {product.sell_price} ج.م
                                    <span className="mx-1.5">·</span>
                                    <span className={product.stock_quantity <= (product.min_stock_limit ?? 0) ? "text-destructive" : "text-emerald-600"}>
                                        {product.stock_quantity} متوفر
                                    </span>
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {open && !loading && results.length === 0 && query.trim() && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-xl px-4 py-3 text-sm text-muted-foreground animate-in slide-in-from-top-2 duration-150">
                    لم يُعثر على منتجات مطابقة
                </div>
            )}
        </div>
    );
}

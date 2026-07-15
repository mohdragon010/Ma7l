"use client";

import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Loader2, Save, X, ChevronDown, ChevronLeft, Package } from "lucide-react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (res.ok) {
                setCategories(data.categories || []);
            }
        } catch (err) {
            toast.error("تعذر جلب التصنيفات");
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (res.ok) {
                setProducts(data.products || []);
            }
        } catch (err) {
            toast.error("تعذر جلب المنتجات");
        }
    };

    useEffect(() => {
        Promise.all([fetchCategories(), fetchProducts()]).finally(() => setLoading(false));
    }, []);

    const getCategoryProducts = (cat) => {
        return products.filter(p =>
            p.category?.some(c =>
                typeof c === "string" ? c === cat.name : (c.id === cat._id || c.name === cat.name)
            )
        );
    };

    const toggleExpand = (id) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const startEdit = (cat) => {
        setEditingId(cat._id);
        setEditValue(cat.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveEdit = async (id) => {
        if (!editValue.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId: id, newName: editValue })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("تم التعديل بنجاح");
                setCategories(prev => prev.map(c => c._id === id ? { ...c, name: editValue } : c));
                cancelEdit();
            } else {
                toast.error(data.message || "تعذر التعديل");
            }
        } catch (err) {
            toast.error("تعذر التعديل");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">إدارة التصنيفات</h1>
                    <p className="text-muted-foreground">قم بتعديل أسماء التصنيفات، وسيتم تحديثها تلقائياً في جميع المنتجات.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>التصنيفات المتاحة</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">اسم التصنيف</TableHead>
                                        <TableHead className="w-32 text-center">عدد المنتجات</TableHead>
                                        <TableHead className="w-32 text-left">إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                                لا توجد تصنيفات لعرضها
                                            </TableCell>
                                        </TableRow>
                                    ) : categories.map(cat => {
                                        const catProducts = getCategoryProducts(cat);
                                        const isExpanded = expandedId === cat._id;
                                        return (
                                            <Fragment key={cat._id}>
                                                <TableRow>
                                                    <TableCell>
                                                        {editingId === cat._id ? (
                                                            <Input
                                                                value={editValue}
                                                                onChange={e => setEditValue(e.target.value)}
                                                                disabled={saving}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpand(cat._id)}
                                                                className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                                                {cat.name}
                                                            </button>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground">
                                                        {catProducts.length}
                                                    </TableCell>
                                                    <TableCell className="text-left">
                                                        {editingId === cat._id ? (
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <Button size="icon" variant="ghost" onClick={() => saveEdit(cat._id)} disabled={saving}>
                                                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-green-600" />}
                                                                </Button>
                                                                <Button size="icon" variant="ghost" onClick={cancelEdit} disabled={saving}>
                                                                    <X className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button size="icon" variant="ghost" onClick={() => startEdit(cat)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                {isExpanded && (
                                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                        <TableCell colSpan={3} className="p-0">
                                                            {catProducts.length === 0 ? (
                                                                <p className="text-center text-muted-foreground py-4 text-sm">
                                                                    لا توجد منتجات في هذا التصنيف
                                                                </p>
                                                            ) : (
                                                                <ul className="divide-y">
                                                                    {catProducts.map(p => (
                                                                        <li key={p._id} className="flex items-center gap-2 px-4 py-2 text-sm">
                                                                            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                                                            <span className="font-medium">{p.name}</span>
                                                                            <span className="ms-auto text-muted-foreground">
                                                                                المخزون: {p.stock_quantity}
                                                                            </span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

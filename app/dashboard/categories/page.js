"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Loader2, Save, X, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catRes, prodRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/products")
            ]);
            const catData = await catRes.json();
            const prodData = await prodRes.json();

            if (catRes.ok) {
                setCategories(catData.categories || []);
            }
            if (prodRes.ok) {
                setProducts(prodData.products || []);
            }
        } catch (err) {
            toast.error("تعذر جلب البيانات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getProductsForCategory = (category) => {
        return products.filter(p => 
            p.category && p.category.some(c => 
                typeof c === 'string' 
                    ? c.toLowerCase() === category.name.toLowerCase() 
                    : c.id === category._id || c.name.toLowerCase() === category.name.toLowerCase()
            )
        );
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
                                        <TableHead className="text-right">المنتجات المرتبطة</TableHead>
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
                                    ) : categories.map(cat => (
                                        <TableRow key={cat._id}>
                                            <TableCell>
                                                {editingId === cat._id ? (
                                                    <Input 
                                                        value={editValue} 
                                                        onChange={e => setEditValue(e.target.value)} 
                                                        disabled={saving}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="font-medium">{cat.name}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const categoryProducts = getProductsForCategory(cat);
                                                    if (categoryProducts.length === 0) {
                                                        return <span className="text-muted-foreground text-xs">لا توجد منتجات</span>;
                                                    }
                                                    return (
                                                        <div className="flex flex-wrap gap-1.5 max-w-md">
                                                            {categoryProducts.slice(0, 3).map(prod => (
                                                                <Badge key={prod._id} variant="secondary">
                                                                    {prod.name}
                                                                </Badge>
                                                            ))}
                                                            {categoryProducts.length > 3 && (
                                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                                    +{categoryProducts.length - 3} إضافي
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
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
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

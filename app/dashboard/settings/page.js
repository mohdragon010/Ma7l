"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Store, User, Lock, Save, Loader2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [storeName, setStoreName] = useState("");
    const [phone, setPhone] = useState("");
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                
                if (res.ok && data.user) {
                    setStoreName(data.user.store_name || "");
                    setPhone(data.user.phone || "");
                    setName(data.user.name || "");
                    setEmail(data.user.email || "");
                }
            } catch (err) {
                toast.error("حدث خطأ أثناء جلب البيانات");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchSettings();
        }
    }, [authLoading]);

    const handleUpdate = async (type) => {
        setSaving(true);
        
        try {
            const payload = {};
            
            if (type === "store") {
                if (!storeName.trim()) return toast.error("اسم المتجر مطلوب");
                payload.store_name = storeName;
                payload.phone = phone;
            } else if (type === "profile") {
                if (!name.trim()) return toast.error("الاسم مطلوب");
                payload.name = name;
            } else if (type === "password") {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    return toast.error("يرجى ملء جميع حقول كلمة المرور");
                }
                if (newPassword !== confirmPassword) {
                    return toast.error("كلمة المرور الجديدة غير متطابقة");
                }
                if (newPassword.length < 6) {
                    return toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
                }
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const res = await fetch("/api/settings/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || "فشل التحديث");
            
            toast.success("تم التحديث بنجاح");
            
            if (type === "password") {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
            
            // Reload to update sidebar store name
            if (type === "store" || type === "profile") {
                 router.refresh();
            }

        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500" dir="rtl">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">الإعدادات</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    أدر بيانات متجرك وحسابك الشخصي
                </p>
            </header>

            <Tabs defaultValue="store" className="w-full" dir="rtl">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="store" className="flex gap-2">
                        <Store className="h-4 w-4" />
                        المتجر
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex gap-2">
                        <User className="h-4 w-4" />
                        الحساب
                    </TabsTrigger>
                </TabsList>

                {/* ── Store Settings ── */}
                <TabsContent value="store" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>بيانات المتجر</CardTitle>
                            <CardDescription>
                                هذه البيانات ستظهر لعملائك وعلى الفواتير المطبوعة.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="store-name">اسم المتجر</FieldLabel>
                                <Input 
                                    id="store-name" 
                                    value={storeName} 
                                    onChange={(e) => setStoreName(e.target.value)} 
                                    placeholder="أدخل اسم المتجر"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="store-phone">رقم الهاتف للعملاء</FieldLabel>
                                <Input 
                                    id="store-phone" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    placeholder="أدخل رقم هاتف المتجر"
                                    dir="ltr"
                                    className="text-right"
                                />
                            </Field>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleUpdate("store")} disabled={saving}>
                                {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                                حفظ التغييرات
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ── Profile & Password Settings ── */}
                <TabsContent value="profile" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>البيانات الشخصية</CardTitle>
                            <CardDescription>
                                بيانات حسابك الأساسية الخاصة بتسجيل الدخول.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="user-name">الاسم الكامل</FieldLabel>
                                <Input 
                                    id="user-name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="أدخل اسمك"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="user-email">البريد الإلكتروني</FieldLabel>
                                <Input 
                                    id="user-email" 
                                    type="email"
                                    value={email} 
                                    disabled
                                    dir="ltr"
                                    className="text-right bg-muted text-muted-foreground"
                                    title="لا يمكن تغيير البريد الإلكتروني لأنه مرتبط بنظام التوثيق"
                                />
                            </Field>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleUpdate("profile")} disabled={saving}>
                                {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                                حفظ البيانات
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-destructive/20">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                تغيير كلمة المرور
                            </CardTitle>
                            <CardDescription>
                                قم بتحديث كلمة المرور الخاصة بك لتأمين حسابك.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="current-password">كلمة المرور الحالية</FieldLabel>
                                <Input 
                                    id="current-password" 
                                    type="password"
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    dir="ltr"
                                />
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="new-password">كلمة المرور الجديدة</FieldLabel>
                                    <Input 
                                        id="new-password" 
                                        type="password"
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        placeholder="••••••••"
                                        dir="ltr"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="confirm-password">تأكيد كلمة المرور</FieldLabel>
                                    <Input 
                                        id="confirm-password" 
                                        type="password"
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        placeholder="••••••••"
                                        dir="ltr"
                                    />
                                </Field>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="destructive" onClick={() => handleUpdate("password")} disabled={saving}>
                                {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Lock className="ml-2 h-4 w-4" />}
                                تحديث كلمة المرور
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

"use client"

import { useState } from "react";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./field";
import { Input } from "./input";
import { Button } from "./button";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "./spinner";
import { useRouter } from "next/navigation";

export default function SignupForm({ setActiveTab }) {
    const router = useRouter()
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        store_name: ""
    });
    const [loading, setLoading] = useState(false)

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleCreateAccount = async e => {
        e.preventDefault();
        setError(null)
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || !formData.store_name.trim()) {
            setError("يجب ملئ جميع البيانات اولََا");
            return
        };
        if (formData.password !== formData.confirmPassword) {
            setError("كلمتا السر غير متطابقتين");
            return;
        }
        try {
            setLoading(true)
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, store_name: formData.store_name })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message ?? "حدث خطأ، يرجى إعادة المحاولة");
            };
            
            router.refresh()
            router.push("/verify-email")
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }
    return (
        <form onSubmit={handleCreateAccount} className="mt-4">
            <FieldGroup className="gap-4">
                {error && (
                    <FieldError className="text-center font-bold text-md">{error}</FieldError>
                )}
                <Field>
                    <FieldLabel htmlFor="name">الأسم كامل</FieldLabel>
                    <Input name="name" id="name" type="text" placeholder="محمد أيمن..." required onChange={handleChange} />
                </Field>
                <Field>
                    <FieldLabel htmlFor="email">البريد الالكتروني</FieldLabel>
                    <Input name="email" id="email" type="email" placeholder="yourname@example.com" dir="ltr" required onChange={handleChange} />
                </Field>
                <Field>
                    <FieldLabel htmlFor="phone">رقم الهاتف</FieldLabel>
                    <Input name="phone" id="phone" type="tel" placeholder="+2010..." dir="ltr" required onChange={handleChange} />
                </Field>
                <Field>
                    <FieldLabel htmlFor="store_name">اسم المتجر</FieldLabel>
                    <Input id="store_name" name="store_name" type="text" placeholder="متجري" onChange={handleChange} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field>
                        <FieldLabel htmlFor="password">كلمة السر</FieldLabel>
                        <div className="relative">
                            <Input name="password" id="password" type={showPassword ? "text" : "password"} placeholder="******" onChange={handleChange} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
                                className="absolute inset-y-0 left-2 flex items-center text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="confirmPassword">تاكيد كلمة السر</FieldLabel>
                        <div className="relative">
                            <Input name="confirmPassword" id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="******" onChange={handleChange} />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                aria-label={showConfirmPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
                                className="absolute inset-y-0 left-2 flex items-center text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </Field>
                </div>
                <Field className="mt-2">
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? <Spinner /> : "إنشاء حساب"}</Button>
                    <FieldDescription className="text-center">
                        لديك حساب بالفعل؟ <a className="cursor-pointer" onClick={() => { setActiveTab("login") }}>تسجيل الدخول</a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}
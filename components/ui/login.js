"use client"

import { useState } from "react";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./field";
import { useRouter } from "next/navigation";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "./spinner";
import { Button } from "./button";

export default function LoginForm({ setActiveTab }){
    const router = useRouter()
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false)



    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]:value}));
    };



    const handleLogin = async e => {
        e.preventDefault()
        setError(null)
        try{
            setLoading(true)
            const res = await fetch("/api/auth/login",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({identifier: formData.identifier, password: formData.password})
            });
            const data = await res.json();

            if(!res.ok){
                setError(data?.message ?? "حدث خطأ، يرجى إعادة المحاولة");
                return;
            }
            router.refresh()
            router.push("/dashboard")
        }catch(err){
            setError(err.message)
        }finally{
            setLoading(false)
        }

    }


    return(
        <form onSubmit={handleLogin} className="mt-4">
            <FieldGroup>
                {error && (
                    <FieldError className="text-center font-bold text-md">{error}</FieldError>
                )}
                
                <Field>
                    <FieldLabel htmlFor="identifier">البريد الالكتروني او رقم الهاتف</FieldLabel>
                    <Input name="identifier" id="identifier" placeholder="example@gmail.com" type="text" dir="ltr" onChange={handleChange} />
                </Field>
                <div className="">
                    <Field>
                        <FieldLabel htmlFor="password">كلمة السر</FieldLabel>
                        <div className="relative flex gap-3">
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
                </div>
                <Field className={"mt-2"}>
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? <Spinner /> : "تسجيل الدخول"}</Button>
                    <FieldDescription className="text-center">
                        ليس لديك حساب؟ <a className="cursor-pointer" onClick={() => { setActiveTab("signup") }}>إنشاء حساب</a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}
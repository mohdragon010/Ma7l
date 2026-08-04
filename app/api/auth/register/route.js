import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers";
import { rateLimiter } from "@/lib/ratelimiter";
import { v4 } from "uuid";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
    try {
        const cookieStore = await cookies()
        const body = await req.json();

        const isAllowed = await rateLimiter(req, { windowMs: 15 * 60 * 1000, limit: 3 })
        if (!isAllowed.ok) {
            return NextResponse.json({ message: "عدد طلبات كثير، يرجى إعادة المحاولة لاحقََا" }, { status: 429 })
        }

        const { name, email, phone, password, store_name } = body
        if (!name || !email || !phone || !password || !store_name || !name.trim() || !email.trim() || !phone.trim() || !password.trim() || !store_name.trim()) {
            return NextResponse.json({ message: "يرجى ملئ جميع الحقول" }, { status: 400 });
        }


        const client = await clientPromise;
        const collection = client.db("Ma7l").collection("users");
        const existingUserEmail = await collection.findOne({ email: email.trim().toLowerCase() });
        if (existingUserEmail) {
            return NextResponse.json({ message: "هناك حساب آخر بنفس البريد الالكتروني" }, { status: 400 });
        }

        const existingUserPhone = await collection.findOne({ phone: phone.trim() });
        if (existingUserPhone) {
            return NextResponse.json({ message: "هناك حساب آخر بنفس الرقم" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const verificationToken = v4()

        const host = req.headers.get("host") || "localhost:3000";
        const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
        const verificationLink = `${protocol}://${host}/verify?token=${verificationToken}`;

        try {
            await sendEmail({
                to: email.trim().toLowerCase(),
                subject: 'تأكيد حسابك في منصة محل',
                html: `
                    <div dir="rtl" style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px 20px; background-color: #f9fafb;">
                        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                            <h1 style="color: #0f172a; margin-bottom: 8px; font-size: 28px; font-weight: bold; margin-top: 0;">
                                <span style="color: #10b981; font-weight: 800;">M</span>a7l<span style="color: #10b981; font-weight: bold;">.</span>
                            </h1>
                            <p style="color: #64748b; font-size: 16px; margin-bottom: 32px; margin-top: 0;">إدارة متجرك بكل سهولة</p>
                            
                            <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">أهلاً بك يا ${name}</h2>
                            <p style="color: #64748b; font-size: 16px; margin-bottom: 32px; line-height: 1.6;">
                                شكراً لتسجيلك في منصة محل. يرجى الضغط على الزر أدناه لتأكيد حسابك والبدء في إدارة متجرك.
                            </p>
                            
                            <a href="${verificationLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 12px 32px; border-radius: 8px; margin-bottom: 32px;">
                                تأكيد الحساب
                            </a>
                            
                            <p style="color: #94a3b8; font-size: 14px; margin-top: 32px; margin-bottom: 0;">
                                إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة.
                            </p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error("Nodemailer Error:", emailError);
            throw new Error("فشل إرسال إيميل التفعيل، يرجى التحقق من إعدادات البريد الإلكتروني");
        }

        const user = await collection.insertOne({ name, email: email.trim().toLowerCase(), phone: phone.trim(), password: hashedPassword, store_name: store_name.trim(), isVerified: false, verificationToken, verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date() });
        const token = jwt.sign({ userId: user.insertedId, name, email: email.trim().toLowerCase(), phone: phone.trim(), store_name: store_name.trim(), isVerified: false }, process.env.JSONWEBTOKEN_SECRET, { expiresIn: "7d" })
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        })


        return NextResponse.json({ message: "تم إنشاء حساب بنجاح", userId: user.insertedId }, { status: 201 });
    } catch (error) {
        console.log("Registration Error: ", error)
        require('fs').appendFileSync('/tmp/ma7l-register-error.log', new Date().toISOString() + ': ' + (error.stack || error) + '\n');
        return NextResponse.json({ message: "خطأ داخلي في الخادم", details: error.message }, { status: 500 });
    }
}
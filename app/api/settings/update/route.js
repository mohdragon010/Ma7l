import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/db";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JSONWEBTOKEN_SECRET));
        return payload;
    } catch {
        return null;
    }
}

export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const user = await authenticate();
        if (!user) return NextResponse.json({ message: "يرجى إعادة تسجيل الدخول" }, { status: 401 });

        const body = await req.json();
        const { name, phone, store_name, currentPassword, newPassword } = body;

        const client = await clientPromise;
        const db = client.db("Ma7l");
        const usersCol = db.collection("users");

        const existingUser = await usersCol.findOne({ _id: new ObjectId(user.userId) });
        if (!existingUser) {
            return NextResponse.json({ message: "المستخدم غير موجود" }, { status: 404 });
        }

        const updates = { updatedAt: new Date() };

        // Handle profile updates
        if (name) updates.name = name.trim();
        if (phone) updates.phone = phone.trim();
        if (store_name) updates.store_name = store_name.trim();

        // Handle password update
        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
            if (!isPasswordValid) {
                return NextResponse.json({ message: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
            }
            updates.password = await bcrypt.hash(newPassword, 10);
        }

        await usersCol.updateOne(
            { _id: new ObjectId(user.userId) },
            { $set: updates }
        );

        // Generate new token with updated data
        const updatedUser = { ...existingUser, ...updates };
        const newToken = jwt.sign(
            {
                userId: updatedUser._id.toString(),
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                store_name: updatedUser.store_name,
                isVerified: updatedUser.isVerified
            },
            process.env.JSONWEBTOKEN_SECRET,
            { expiresIn: "7d" }
        );

        cookieStore.set('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return NextResponse.json({ message: "تم تحديث الإعدادات بنجاح" }, { status: 200 });
    } catch (err) {
        console.error("Settings update error:", err);
        return NextResponse.json({ message: "حدث خطأ أثناء تحديث الإعدادات" }, { status: 500 });
    }
}

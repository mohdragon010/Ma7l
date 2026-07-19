import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import clientPromise from "@/lib/db";
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

export async function GET(req) {
    try {
        const user = await authenticate();
        if (!user) return NextResponse.json({ message: "يرجى إعادة تسجيل الدخول" }, { status: 401 });

        const client = await clientPromise;
        const db = client.db("Ma7l");
        const usersCol = db.collection("users");

        const userData = await usersCol.findOne(
            { _id: new ObjectId(user.userId) },
            { projection: { password: 0, verificationToken: 0, verificationTokenExpiry: 0 } }
        );

        if (!userData) {
            return NextResponse.json({ message: "المستخدم غير موجود" }, { status: 404 });
        }

        return NextResponse.json({ user: userData }, { status: 200 });
    } catch (err) {
        console.error("Settings fetch error:", err);
        return NextResponse.json({ message: "حدث خطأ أثناء جلب الإعدادات" }, { status: 500 });
    }
}

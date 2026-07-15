import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import clientPromise from "@/lib/db";
import { cookies } from "next/headers";

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

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q")?.trim() ?? "";

        if (!q) return NextResponse.json({ products: [] }, { status: 200 });

        const client = await clientPromise;
        const collection = client.db("Ma7l").collection("products");

        // Search by barcode (exact) OR name (case-insensitive)
        const products = await collection.find({
            ownerId: user.userId,
            $or: [
                { barcode: q },
                { name: { $regex: q, $options: "i" } },
            ],
        }).limit(8).toArray();

        return NextResponse.json({ products }, { status: 200 });
    } catch (err) {
        console.error("Product search error:", err);
        return NextResponse.json({ message: "حدث خطأ في الخادم" }, { status: 500 });
    }
}

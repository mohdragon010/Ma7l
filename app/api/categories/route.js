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

export async function GET() {
    try {
        const user = await authenticate();
        if (!user) return NextResponse.json({ message: "يرجى إعادة تسجيل الدخول" }, { status: 401 });

        const client = await clientPromise;
        const collection = client.db("Ma7l").collection("categories");
        
        const categories = await collection.find({ ownerId: user.userId }).toArray();
        return NextResponse.json({ categories }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "حدث خطأ داخلي" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await authenticate();
        if (!user) return NextResponse.json({ message: "يرجى إعادة تسجيل الدخول" }, { status: 401 });

        const { name } = await req.json();
        if (!name || !name.trim()) return NextResponse.json({ message: "اسم التصنيف مطلوب" }, { status: 400 });

        const client = await clientPromise;
        const collection = client.db("Ma7l").collection("categories");
        
        const newCategory = { ownerId: user.userId, name: name.trim() };
        const result = await collection.insertOne(newCategory);
        
        return NextResponse.json({ 
            message: "تم إنشاء التصنيف بنجاح", 
            category: { _id: result.insertedId, ...newCategory } 
        }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "حدث خطأ داخلي" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const user = await authenticate();
        if (!user) return NextResponse.json({ message: "يرجى إعادة تسجيل الدخول" }, { status: 401 });

        const { targetId, newName } = await req.json();
        if (!targetId || !newName || !newName.trim()) {
            return NextResponse.json({ message: "البيانات غير مكتملة" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("Ma7l");
        
        // 1. Update the category name
        const updateResult = await db.collection("categories").updateOne(
            { _id: new ObjectId(targetId), ownerId: user.userId },
            { $set: { name: newName.trim() } }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ message: "التصنيف غير موجود أو لا تملك صلاحية تعديله" }, { status: 404 });
        }   

        // 2. Denormalization update: update category name in all products that use this category
        await db.collection("products").updateMany(
            { ownerId: user.userId, "category.id": targetId },
            { $set: { "category.$.name": newName.trim() } }
        );

        return NextResponse.json({ message: "تم تعديل التصنيف بنجاح" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "حدث خطأ في الخادم" }, { status: 500 });
    }
}

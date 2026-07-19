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

export async function POST(req) {
    try {
        const user = await authenticate();
        if (!user) return NextResponse.json({ message: "يرجى إعادة تسجيل الدخول" }, { status: 401 });

        const body = await req.json();
        const { items, subtotal, discount, discountType, total, paid } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ message: "الفاتورة فارغة" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("Ma7l");
        const productsCol = db.collection("products");

        // Validate stock for each item before committing
        for (const item of items) {
            const product = await productsCol.findOne({
                _id: new ObjectId(item._id),
                ownerId: user.userId,
            });
            if (!product) {
                return NextResponse.json({ message: `المنتج "${item.name}" غير موجود` }, { status: 400 });
            }
            if (product.stock_quantity < item.quantity) {
                return NextResponse.json({
                    message: `الكمية المطلوبة من "${item.name}" (${item.quantity}) تتجاوز المخزون المتاح (${product.stock_quantity})`
                }, { status: 400 });
            }
        }

        // Deduct stock for each item
        for (const item of items) {
            await productsCol.updateOne(
                { _id: new ObjectId(item._id), ownerId: user.userId },
                { $inc: { stock_quantity: -item.quantity } }
            );
        }

        // Calculate profit = sum of (sell_price - buy_price) * quantity
        const profit = items.reduce((acc, item) => {
            const itemProfit = (Number(item.sell_price) - Number(item.buy_price)) * item.quantity;
            return acc + itemProfit;
        }, 0);

        // Save the sale record
        const saleDoc = {
            ownerId: user.userId,
            items: items.map(i => ({
                productId: i._id,
                name: i.name,
                quantity: i.quantity,
                sell_price: Number(i.sell_price),
                buy_price: Number(i.buy_price),
            })),
            subtotal: Number(subtotal),
            discount: Number(discount),
            discountType: discountType || "fixed",
            total: Number(total),
            paid: Number(paid),
            change: Number(paid) - Number(total),
            profit: Number(profit.toFixed(2)),
            createdAt: new Date(),
        };

        const result = await db.collection("sales").insertOne(saleDoc);

        return NextResponse.json({
            message: "تم تأكيد البيع بنجاح",
            saleId: result.insertedId.toString(),
            profit: saleDoc.profit,
        }, { status: 201 });

    } catch (err) {
        console.error("Sales error:", err);
        return NextResponse.json({ message: "حدث خطأ في الخادم" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const user = await authenticate();
        if (!user) return NextResponse.json({ message: "يرجى إعادة تسجيل الدخول" }, { status: 401 });

        const client = await clientPromise;
        const db = client.db("Ma7l");
        const salesCol = db.collection("sales");

        const sales = await salesCol.find({ ownerId: user.userId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ sales }, { status: 200 });
    } catch (err) {
        console.error("Sales fetch error:", err);
        return NextResponse.json({ message: "حدث خطأ أثناء جلب المبيعات" }, { status: 500 });
    }
}

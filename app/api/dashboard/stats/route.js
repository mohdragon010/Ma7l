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
        if (!user) {
            return NextResponse.json({ message: "يرجى إعادة تسجيل الدخول" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("Ma7l");

        // Fetch products and categories
        const products = await db.collection("products").find({ ownerId: user.userId }).toArray();
        const categories = await db.collection("categories").find({ ownerId: user.userId }).toArray();

        // 1. Calculations for Stat Cards
        let totalCapital = 0;
        let totalProducts = products.length;
        let totalCategories = categories.length;
        let criticalLowStockCount = 0;

        products.forEach(p => {
            const stock = Number(p.stock_quantity) || 0;
            const buyPrice = Number(p.buy_price) || 0;
            totalCapital += stock * buyPrice;

            if (stock <= (Number(p.min_stock_limit) || 0)) {
                criticalLowStockCount++;
            }
        });

        // 2. Bar Chart: Total value of goods per category
        const categoryValueMap = {};
        products.forEach(p => {
            const stock = Number(p.stock_quantity) || 0;
            const buyPrice = Number(p.buy_price) || 0;
            const value = stock * buyPrice;

            if (p.category && Array.isArray(p.category) && p.category.length > 0) {
                p.category.forEach(cat => {
                    const catName = typeof cat === 'string' ? cat : (cat.name || "غير محدد");
                    categoryValueMap[catName] = (categoryValueMap[catName] || 0) + value;
                });
            } else {
                categoryValueMap["بدون تصنيف"] = (categoryValueMap["بدون تصنيف"] || 0) + value;
            }
        });

        const categoryValues = Object.entries(categoryValueMap).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);

        // 3. Pie Chart: Low-stock vs Healthy stock
        const healthyCount = totalProducts - criticalLowStockCount;
        const stockStatusData = [
            { name: "متوفر", value: healthyCount },
            { name: "نواقص", value: criticalLowStockCount }
        ];

        // 4. Latest 5 products added
        const latestProducts = [...products]
            .sort((a, b) => b._id.toString().localeCompare(a._id.toString()))
            .slice(0, 5)
            .map(p => ({
                _id: p._id.toString(),
                name: p.name,
                image: p.image,
                createdAt: new ObjectId(p._id).getTimestamp().toISOString(),
                stock_quantity: p.stock_quantity,
                sell_price: p.sell_price,
                buy_price: p.buy_price
            }));

        // 5. Critical 5 low stock products (sorted by stock quantity ascending)
        const criticalLowStockList = products
            .filter(p => Number(p.stock_quantity) <= (Number(p.min_stock_limit) || 0))
            .sort((a, b) => (Number(a.stock_quantity) || 0) - (Number(b.stock_quantity) || 0))
            .slice(0, 5)
            .map(p => ({
                _id: p._id.toString(),
                name: p.name,
                image: p.image,
                stock_quantity: p.stock_quantity,
                min_stock_limit: p.min_stock_limit,
                sell_price: p.sell_price,
                buy_price: p.buy_price
            }));

        return NextResponse.json({
            stats: {
                totalCapital,
                totalProducts,
                totalCategories,
                criticalLowStockCount,
            },
            categoryValues,
            stockStatusData,
            latestProducts,
            criticalLowStockList
        }, { status: 200 });

    } catch (err) {
        console.error("Dashboard stats error:", err);
        return NextResponse.json({ message: "حدث خطأ في الخادم، يرجى إعادة المحاولة لاحقاً" }, { status: 500 });
    }
}

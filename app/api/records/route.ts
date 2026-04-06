import { prisma } from "@/app/lib/prisma";
import { getUserFromCookie } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import { RecordType } from "@prisma/client";

// ---------------- POST: Create Record (Expense or Bonus) ----------------
export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, type, category, userId } = await req.json();
    if (!amount || !type) return NextResponse.json({ error: "Missing amount or type" }, { status: 400 });
    if (type.toLowerCase() === "expense" && !category) return NextResponse.json({ error: "Category required for expense" }, { status: 400 });

    let finalUserId = user.id;
    if (user.role === "ADMIN" && userId) finalUserId = userId;

    const formattedType: RecordType = type.toLowerCase() === "income" ? "income" : "expense";

    const recordData: any = { amount: Number(amount), type: formattedType, date: new Date(), user: { connect: { id: finalUserId } } };
    if (formattedType === "expense") recordData.category = category;

    const record = await prisma.record.create({ data: recordData });

    // ---------------- Calculate balances ----------------
    const now = new Date();
    const userWithRecords = await prisma.user.findUnique({
      where: { id: finalUserId },
      include: { records: true },
    });
    if (!userWithRecords) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let monthlyExpense = 0;
    let yearlyExpense = 0;
    let monthlyBonus = 0;
    let yearlyBonus = 0;

    userWithRecords.records.forEach(r => {
      const recordDate = new Date(r.date);
      if (recordDate.getFullYear() === now.getFullYear() && recordDate.getMonth() === now.getMonth()) {
        if (r.type === "expense") monthlyExpense += r.amount;
        if (r.type === "income") monthlyBonus += r.amount;
      }
      if (recordDate.getFullYear() === now.getFullYear()) {
        if (r.type === "expense") yearlyExpense += r.amount;
        if (r.type === "income") yearlyBonus += r.amount;
      }
    });

    const monthlyBalance = (userWithRecords.monthlyIncome || 0) - monthlyExpense;
    const yearlyBalance = (userWithRecords.yearlyIncome || 0) - yearlyExpense;

    return NextResponse.json({
      record,
      monthlyExpense,
      yearlyExpense,
      monthlyBonus,
      yearlyBonus,
      monthlyBalance,
      yearlyBalance,
    }, { status: 201 });
  } catch (err) {
    console.error("RECORD ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------------- GET: Recent Activities ----------------
export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let whereClause: any = { date: { gte: yesterday } };

    if (user.role === "VIEWER") whereClause.userId = user.id;
    else if (user.role === "ADMIN") whereClause.userId = { not: user.id }; // exclude self
    else if (user.role === "ANALYST") whereClause.user = { role: { not: "ADMIN" } };

    const records = await prisma.record.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        user: { select: { email: true, role: true } },
      },
    });

    return NextResponse.json(records);
  } catch (err) {
    console.error("GET /records error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { prisma } from "@/app/lib/prisma";
import { getUserFromCookie } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUserFromCookie();

    // 👇 filter based on role
    const where =
      user.role === "ADMIN" || user.role === "ANALYST"
        ? {}
        : { userId: user.id };

    // 🔹 ALL RECORDS
    const records = await prisma.record.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5, // recent activity
    });

    // 🔹 TOTAL INCOME
    const income = await prisma.record.aggregate({
      where: { ...where, type: "INCOME" },
      _sum: { amount: true },
    });

    // 🔹 TOTAL EXPENSE
    const expense = await prisma.record.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
    });

    // 🔹 CATEGORY WISE
    const category = await prisma.record.groupBy({
      by: ["category"],
      where,
      _sum: { amount: true },
    });

    // 🔹 MONTHLY TREND
    const monthly = await prisma.record.findMany({
      where,
      select: {
        amount: true,
        createdAt: true,
        type: true,
      },
    });

    const monthlySummary: any = {};

    monthly.forEach((r) => {
      const month = new Date(r.createdAt).toLocaleString("default", {
        month: "short",
      });

      if (!monthlySummary[month]) {
        monthlySummary[month] = { income: 0, expense: 0 };
      }

      if (r.type === "INCOME") {
        monthlySummary[month].income += r.amount;
      } else {
        monthlySummary[month].expense += r.amount;
      }
    });

    const monthlyData = Object.entries(monthlySummary).map(
      ([month, val]: any) => ({
        month,
        ...val,
      })
    );

    return NextResponse.json({
      totalIncome: income._sum.amount || 0,
      totalExpense: expense._sum.amount || 0,
      netBalance:
        (income._sum.amount || 0) - (expense._sum.amount || 0),
      category: category.map((c) => ({
        category: c.category,
        amount: c._sum.amount,
      })),
      recent: records,
      monthly: monthlyData,
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
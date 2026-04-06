// app/api/analytics/user-summary/route.ts
import { prisma } from "@/app/lib/prisma";
import { getUserFromCookie } from "@/app/lib/auth";
import { NextResponse } from "next/server";

// ---------------- HELPERS ----------------
function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getYearRange(date: Date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}

function groupByCategory(records: any[]) {
  const grouped: Record<string, number> = {};

  records.forEach(r => {
    const key = r.category || "Other";
    if (!grouped[key]) grouped[key] = 0;
    grouped[key] += r.amount;
  });

  return Object.entries(grouped).map(([category, amount]) => ({
    category,
    amount
  }));
}

// ---------------- API ----------------
export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Get user (for salary)
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { monthlyIncome: true }
    });

    // ✅ Get records
    const records = await prisma.record.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" }
    });

    const now = new Date();
    const { start: monthStart, end: monthEnd } = getMonthRange(now);
    const { start: yearStart, end: yearEnd } = getYearRange(now);

    // ---------------- Monthly ----------------
    const monthlyRecords = records.filter(
      r => r.date >= monthStart && r.date <= monthEnd
    );

    // ✅ FIXED: Monthly income from USER MODEL
    const monthlyIncome = userData?.monthlyIncome || 0;

    const monthlyExpense = monthlyRecords
      .filter(r => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);

    // ---------------- Yearly ----------------
    const yearlyRecords = records.filter(
      r => r.date >= yearStart && r.date <= yearEnd
    );

    // ✅ FIXED: Yearly income from USER MODEL
    const yearlyIncome = (userData?.monthlyIncome || 0) * 12;

    const yearlyExpense = yearlyRecords
      .filter(r => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);

    // ---------------- Category (Monthly) ----------------
    const monthlyCategory = groupByCategory(
      monthlyRecords.filter(r => r.type === "expense")
    );

    return NextResponse.json({
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,

      yearlyIncome,
      yearlyExpense,
      yearlyBalance: yearlyIncome - yearlyExpense,

      categoryData: monthlyCategory
    });

  } catch (err) {
    console.error("USER SUMMARY ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
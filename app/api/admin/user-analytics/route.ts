// app/api/admin/user-analytics/route.ts
import { prisma } from "@/app/lib/prisma";
import { getUserFromCookie, requireRole } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getUserFromCookie();
    requireRole(currentUser, ["ADMIN", "ANALYST"]);

    // Fetch all non-admin users first
    let users = await prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
      select: {
        id: true,
        email: true,
        role: true,
        monthlyIncome: true,
        records: { select: { amount: true, type: true, date: true, category: true } },
      },
    });

    // Admin: remove self
    if (currentUser.role === "ADMIN") {
      users = users.filter(u => u.id !== currentUser.id);
    }

    // Analyst: ensure self is included
    if (currentUser.role === "ANALYST" && !users.some(u => u.id === currentUser.id)) {
      const self = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true,
          email: true,
          role: true,
          monthlyIncome: true,
          records: { select: { amount: true, type: true, date: true, category: true } },
        },
      });
      if (self) users.unshift(self);
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const result = users.map(u => {
      const monthlyExpense = u.records
        .filter(r => r.type === "expense" && new Date(r.date).getMonth() === currentMonth && new Date(r.date).getFullYear() === currentYear)
        .reduce((sum, r) => sum + r.amount, 0);

      const yearlyExpense = u.records
        .filter(r => r.type === "expense" && new Date(r.date).getFullYear() === currentYear)
        .reduce((sum, r) => sum + r.amount, 0);

      const categoryData: Record<string, number> = {};
      u.records.filter(r => r.type === "expense").forEach(r => {
        if (r.category) categoryData[r.category] = (categoryData[r.category] || 0) + r.amount;
      });

      return {
        id: u.id,
        email: u.email,
        role: u.role,
        monthlyIncome: u.monthlyIncome || 0,
        monthlyExpense,
        yearlyIncome: (u.monthlyIncome || 0) * 12,
        yearlyExpense,
        categoryData,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /admin/user-analytics error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
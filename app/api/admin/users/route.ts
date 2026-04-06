import { prisma } from "@/app/lib/prisma";
import { getUserFromCookie } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getUserFromCookie();

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { id: { not: currentUser.id } }, // exclude self
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        monthlyIncome: true,
      },
    });

    const usersWithYearly = users.map(u => ({
      ...u,
      monthlyIncome: u.monthlyIncome || 0,
      yearlyIncome: (u.monthlyIncome || 0) * 12,
    }));

    return NextResponse.json(usersWithYearly);
  } catch (err) {
    console.error("GET /admin/users error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
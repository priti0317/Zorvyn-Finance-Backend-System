import { prisma } from "@/app/lib/prisma";
import { getUserFromCookie } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUserFromCookie();

    let records;

    // ✅ ADMIN & ANALYST → ALL DATA
    if (user.role === "ADMIN" || user.role === "ANALYST") {
      records = await prisma.record.findMany();
    } else {
      // ✅ VIEWER → ONLY OWN DATA
      records = await prisma.record.findMany({
        where: { userId: user.id },
      });
    }

    // 📊 Aggregate category-wise
    const summary: any = {};

    records.forEach((r) => {
      summary[r.category] =
        (summary[r.category] || 0) + r.amount;
    });

    return NextResponse.json(summary);

  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
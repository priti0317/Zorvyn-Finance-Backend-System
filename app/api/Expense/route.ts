import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/app/lib/auth";

export async function POST(req: Request) {
  const user = getUserFromCookie(req);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admin can add" }, { status: 403 });
  }

  const body = await req.json();

  const record = await prisma.record.create({
    data: {
      amount: body.amount,
      category: body.category,
      type: body.type,
      userId: user.id,
    },
  });

  return NextResponse.json(record);
}
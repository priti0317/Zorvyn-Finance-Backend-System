// app/api/admin/users/[id]/route.ts
import { prisma } from "@/app/lib/prisma";
import { getUserFromCookie, requireRole } from "@/app/lib/auth";
import { NextResponse } from "next/server";

// ---------------- UPDATE USER ----------------
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();
    requireRole(user, ["ADMIN"]);

    const { id } = await context.params;
    const { role, status, monthlyIncome } = await req.json();

    const dataToUpdate: any = {};
    if (role) dataToUpdate.role = role;
    if (status) dataToUpdate.status = status;
    if (monthlyIncome !== undefined) {
      const incomeNumber = Number(monthlyIncome);
      if (isNaN(incomeNumber) || incomeNumber < 0)
        return NextResponse.json({ error: "Invalid monthlyIncome" }, { status: 400 });
      dataToUpdate.monthlyIncome = incomeNumber;
      dataToUpdate.yearlyIncome = incomeNumber * 12;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("PATCH /admin/users/[id] error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ---------------- DELETE USER ----------------
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();
    requireRole(user, ["ADMIN"]);

    const { id } = await context.params;

    // Prevent deleting self
    if (user.id === id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Delete user
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("DELETE /admin/users/[id] error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
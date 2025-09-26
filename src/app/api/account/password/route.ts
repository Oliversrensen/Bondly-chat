import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-full";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

export const runtime = "nodejs";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (pw.length > 72) return "Password too long.";
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return new NextResponse("unauthorized", { status: 401 });

  const { password, currentPassword } = await req.json().catch(() => ({}));
  if (typeof password !== "string") {
    return new NextResponse("Missing password", { status: 400 });
  }

  const msg = validatePassword(password);
  if (msg) return new NextResponse(msg, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, passwordHash: true }, // ⬅️ include it
  });
  if (!user) return new NextResponse("user not found", { status: 404 });

  if (user.passwordHash) {
    if (typeof currentPassword !== "string") {
      return new NextResponse("Current password required to change password.", { status: 400 });
    }
    const ok = await compare(currentPassword, user.passwordHash);
    if (!ok) return new NextResponse("Current password is incorrect.", { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.update({
    where: { id: uid },
    data: { passwordHash, passwordSetAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

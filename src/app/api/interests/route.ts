import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.interest.findMany({ orderBy: { name: "asc" } });
  // return just names
  return NextResponse.json(rows.map((r) => r.name));
}

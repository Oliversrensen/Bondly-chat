import { handlers } from "@/lib/auth-full";
export const { GET, POST } = handlers;
export const runtime = "nodejs"; // Prisma needs Node runtime, not Edge

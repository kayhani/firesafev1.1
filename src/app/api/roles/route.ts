// app/api/roles/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const roles = await prisma.roles.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.log("[ROLES_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
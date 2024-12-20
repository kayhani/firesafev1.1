// app/api/isgMembers/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const members = await prisma.isgMembers.findMany({
            select: {
                id: true,
                name: true,
                isgNumber: true,
                institution: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(members);
    } catch (error) {
        console.log("[ISG_MEMBERS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
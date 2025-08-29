import { and, eq, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.enterprise?.id) {
        return NextResponse.json({ notConfirmed: 0, toConclude: 0 }, { status: 200 });
    }

    const enterpriseId = session.user.enterprise.id;

    const now = new Date();

    const [notConfirmed, scheduledPast] = await Promise.all([
        db
            .select({ id: appointmentsTable.id })
            .from(appointmentsTable)
            .where(
                and(
                    eq(appointmentsTable.enterpriseId, enterpriseId),
                    eq(appointmentsTable.status, "not-confirmed"),
                ),
            ),
        db
            .select({ id: appointmentsTable.id })
            .from(appointmentsTable)
            .where(
                and(
                    eq(appointmentsTable.enterpriseId, enterpriseId),
                    eq(appointmentsTable.status, "scheduled"),
                    lt(appointmentsTable.date, now),
                ),
            ),
    ]);

    return NextResponse.json({
        notConfirmed: notConfirmed.length,
        toConclude: scheduledPast.length,
    });
}



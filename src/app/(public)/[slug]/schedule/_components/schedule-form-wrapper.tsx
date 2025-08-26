"use client";

import { useEffect, useState } from "react";

import ScheduleForm from "./schedule-form";

interface ScheduleFormWrapperProps {
    services: Array<{
        id: string;
        name: string;
        servicePriceInCents: number;
    }>;
    professionals: Array<{
        id: string;
        name: string;
        specialty: string;
        availableFromWeekDay: number;
        availableToWeekDay: number;
    }>;
    enterpriseId: string;
    clientId: string;
    enterpriseSlug: string;
}

const ScheduleFormWrapper = (props: ScheduleFormWrapperProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-64 bg-muted animate-pulse rounded-lg" />
        );
    }

    return <ScheduleForm {...props} />;
};

export default ScheduleFormWrapper;

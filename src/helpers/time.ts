export const generateTimeSlots = (stepMinutes: number = 30) => {
    const slots: string[] = [];

    // Validate and sanitize step
    const step = Number.isFinite(stepMinutes) && stepMinutes > 0
        ? Math.floor(stepMinutes)
        : 30;

    const startTotalMinutes = 5 * 60; // 05:00
    const endTotalMinutes = 23 * 60 + 59; // 23:59

    for (let total = startTotalMinutes; total <= endTotalMinutes; total += step) {
        const hour = Math.floor(total / 60);
        const minute = total % 60;
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}:00`;
        slots.push(timeString);
    }

    return slots;
};
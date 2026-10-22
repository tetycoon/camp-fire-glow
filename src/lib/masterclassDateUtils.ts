import { format } from "date-fns";

export interface MasterclassSessionSlot {
    id: "wednesday" | "sunday";
    date: Date;
    dayName: string; // "Wednesday" or "Sunday"
    timeSlot: string; // "6:00 PM – 9:00 PM IST" or "10:00 AM – 1:00 PM IST"
    shortTime: string; // "6:00 PM IST" or "10:00 AM IST"
    timingLabel: string; // "Evening (6:00 PM – 9:00 PM IST)" or "Morning (10:00 AM – 1:00 PM IST)"
    dateString: string; // "21st October 2026"
    regularDate: string; // "21st October 2026 (Wednesday)"
    fullLabel: string; // "Wednesday, 21st October 2026 • 6:00 PM – 9:00 PM IST (Evening)"
    badgeLabel: string; // "Wed, 21st Oct • 6:00 PM – 9:00 PM IST"
}

export function getNextWednesdaySession(now: Date = new Date()): Date {
    const day = now.getDay(); // 0 is Sunday, 3 is Wednesday
    const target = new Date(now);
    target.setHours(18, 0, 0, 0);

    if (day === 3) {
        if (now.getTime() >= target.getTime()) {
            target.setDate(target.getDate() + 7);
        }
    } else {
        const diff = (3 - day + 7) % 7;
        target.setDate(target.getDate() + diff);
    }
    return target;
}

export function getNextSundaySession(now: Date = new Date()): Date {
    const day = now.getDay(); // 0 is Sunday
    const target = new Date(now);
    target.setHours(10, 0, 0, 0);

    if (day === 0) {
        if (now.getTime() >= target.getTime()) {
            target.setDate(target.getDate() + 7);
        }
    } else {
        const diff = (7 - day) % 7;
        target.setDate(target.getDate() + diff);
    }
    return target;
}

export function getMasterclassSlots(now: Date = new Date()) {
    const wedDate = getNextWednesdaySession(now);
    const sunDate = getNextSundaySession(now);

    const wednesdaySlot: MasterclassSessionSlot = {
        id: "wednesday",
        date: wedDate,
        dayName: "Wednesday",
        timeSlot: "6:00 PM – 9:00 PM IST",
        shortTime: "6:00 PM IST",
        timingLabel: "Wednesday Evening (6:00 PM – 9:00 PM IST)",
        dateString: format(wedDate, "do MMMM yyyy"),
        regularDate: format(wedDate, "do MMMM yyyy (EEEE)"),
        fullLabel: `Wednesday Evening, ${format(wedDate, "do MMMM yyyy")} (6:00 PM – 9:00 PM IST)`,
        badgeLabel: `Wed, ${format(wedDate, "do MMM")} • 6:00 PM – 9:00 PM IST`
    };

    const sundaySlot: MasterclassSessionSlot = {
        id: "sunday",
        date: sunDate,
        dayName: "Sunday",
        timeSlot: "10:00 AM – 1:00 PM IST",
        shortTime: "10:00 AM IST",
        timingLabel: "Sunday Morning (10:00 AM – 1:00 PM IST)",
        dateString: format(sunDate, "do MMMM yyyy"),
        regularDate: format(sunDate, "do MMMM yyyy (EEEE)"),
        fullLabel: `Sunday Morning, ${format(sunDate, "do MMMM yyyy")} (10:00 AM – 1:00 PM IST)`,
        badgeLabel: `Sun, ${format(sunDate, "do MMM")} • 10:00 AM – 1:00 PM IST`
    };

    const isWednesdayNext = wedDate.getTime() < sunDate.getTime();
    const nextSession = isWednesdayNext ? wednesdaySlot : sundaySlot;
    const orderedSlots = isWednesdayNext ? [wednesdaySlot, sundaySlot] : [sundaySlot, wednesdaySlot];

    return {
        nextSession,
        wednesdaySlot,
        sundaySlot,
        orderedSlots
    };
}

export function getNextMasterclassDate(): Date {
    return getMasterclassSlots().nextSession.date;
}

export function getMasterclassDateStrings() {
    const { nextSession, wednesdaySlot, sundaySlot, orderedSlots } = getMasterclassSlots();
    const targetDate = nextSession.date;

    return {
        // "21st October 2026 (Wednesday)"
        regularDate: nextSession.regularDate,

        // "October 21, 2026"
        shortDate: format(targetDate, "MMMM d, yyyy"),

        // "21ST OCTOBER 2026"
        upperDate: format(targetDate, "do MMMM yyyy").toUpperCase(),

        // "WEDNESDAY"
        dayOfWeek: format(targetDate, "EEEE").toUpperCase(),

        // Active next session time string
        timeSlot: nextSession.timeSlot,
        shortTime: nextSession.shortTime,

        // Slots
        nextSession,
        wednesdaySlot,
        sundaySlot,
        orderedSlots
    };
}

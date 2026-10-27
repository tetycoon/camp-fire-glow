import { format } from "date-fns";

export interface MasterclassSessionSlot {
    id: "wednesday" | "friday" | "sunday";
    date: Date;
    dayName: string; // "Wednesday", "Friday", or "Sunday"
    timeSlot: string; // "5:30 PM – 8:30 PM IST" or "10:00 AM – 1:00 PM IST"
    shortTime: string; // "5:30 PM IST" or "10:00 AM IST"
    timingLabel: string; // "Wednesday Evening (5:30 PM – 8:30 PM IST)", "Friday Evening (5:30 PM – 8:30 PM IST)", or "Sunday Morning (10:00 AM – 1:00 PM IST)"
    dateString: string; // "21st October 2026"
    regularDate: string; // "21st October 2026 (Wednesday)"
    fullLabel: string; // "Wednesday Evening, 21st October 2026 (5:30 PM – 8:30 PM IST)"
    badgeLabel: string; // "Wed, 21st Oct • 5:30 PM – 8:30 PM IST"
}

export function getNextWednesdaySession(now: Date = new Date()): Date {
    const day = now.getDay(); // 0 is Sunday, 3 is Wednesday
    const target = new Date(now);
    target.setHours(17, 30, 0, 0);

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

export function getNextFridaySession(now: Date = new Date()): Date {
    const day = now.getDay(); // 0 is Sunday, 5 is Friday
    const target = new Date(now);
    target.setHours(17, 30, 0, 0);

    if (day === 5) {
        if (now.getTime() >= target.getTime()) {
            target.setDate(target.getDate() + 7);
        }
    } else {
        const diff = (5 - day + 7) % 7;
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
    const friDate = getNextFridaySession(now);
    const sunDate = getNextSundaySession(now);

    const wednesdaySlot: MasterclassSessionSlot = {
        id: "wednesday",
        date: wedDate,
        dayName: "Wednesday",
        timeSlot: "5:30 PM – 8:30 PM IST",
        shortTime: "5:30 PM IST",
        timingLabel: "Wednesday Evening (5:30 PM – 8:30 PM IST)",
        dateString: format(wedDate, "do MMMM yyyy"),
        regularDate: format(wedDate, "do MMMM yyyy (EEEE)"),
        fullLabel: `Wednesday Evening, ${format(wedDate, "do MMMM yyyy")} (5:30 PM – 8:30 PM IST)`,
        badgeLabel: `Wed, ${format(wedDate, "do MMM")} • 5:30 PM – 8:30 PM IST`
    };

    const fridaySlot: MasterclassSessionSlot = {
        id: "friday",
        date: friDate,
        dayName: "Friday",
        timeSlot: "5:30 PM – 8:30 PM IST",
        shortTime: "5:30 PM IST",
        timingLabel: "Friday Evening (5:30 PM – 8:30 PM IST)",
        dateString: format(friDate, "do MMMM yyyy"),
        regularDate: format(friDate, "do MMMM yyyy (EEEE)"),
        fullLabel: `Friday Evening, ${format(friDate, "do MMMM yyyy")} (5:30 PM – 8:30 PM IST)`,
        badgeLabel: `Fri, ${format(friDate, "do MMM")} • 5:30 PM – 8:30 PM IST`
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

    const orderedSlots = [wednesdaySlot, fridaySlot, sundaySlot].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
    );
    const nextSession = orderedSlots[0];

    return {
        nextSession,
        wednesdaySlot,
        fridaySlot,
        sundaySlot,
        orderedSlots
    };
}

export function getNextMasterclassDate(): Date {
    return getMasterclassSlots().nextSession.date;
}

export function getMasterclassDateStrings() {
    const { nextSession, wednesdaySlot, fridaySlot, sundaySlot, orderedSlots } = getMasterclassSlots();
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
        fridaySlot,
        sundaySlot,
        orderedSlots
    };
}

import { isAfter, isWednesday, nextWednesday, set, format } from "date-fns";

export function getNextMasterclassDate() {
    const now = new Date();
    
    // Special scheduling: Wednesday, October 7th, 2026 at 6:00 PM (month index 9 for October)
    const specialSession = new Date(2026, 9, 7, 18, 0, 0);
    
    if (now < specialSession) {
        return specialSession;
    }
    
    // Set target to today at 18:00:00 (6:00 PM)
    let target = set(now, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    
    if (isWednesday(now)) {
        // If today is Wednesday and it is past 6:00 PM, target the next Wednesday
        if (isAfter(now, target)) {
            target = nextWednesday(now);
            target = set(target, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
        }
    } else {
        // If today is not Wednesday, target the next Wednesday
        target = nextWednesday(now);
        target = set(target, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    }
    
    return target;
}

export function getMasterclassDateStrings() {
    const targetDate = getNextMasterclassDate();
    
    return {
        // "25th April 2026 (Friday)"
        regularDate: format(targetDate, "do MMMM yyyy (EEEE)"),
        
        // "April 25, 2026"
        shortDate: format(targetDate, "MMMM d, yyyy"),

        // "20TH JUNE 2026"
        upperDate: format(targetDate, "do MMMM yyyy").toUpperCase(),

        // "FRIDAY"
        dayOfWeek: format(targetDate, "EEEE").toUpperCase()
    };
}

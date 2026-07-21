import { isAfter, isSaturday, nextSaturday, set, format } from "date-fns";

export function getNextMasterclassDate() {
    const now = new Date();
    
    // Special scheduling: Friday, July 24th, 2026 at 6:00 PM (month index 6 for July)
    const specialSession = new Date(2026, 6, 24, 18, 0, 0);
    
    if (now < specialSession) {
        return specialSession;
    }
    
    // Set target to today at 18:00:00 (6:00 PM)
    let target = set(now, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    
    if (isSaturday(now)) {
        // If today is Saturday and it is past 6:00 PM, target the next Saturday
        if (isAfter(now, target)) {
            target = nextSaturday(now);
            target = set(target, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
        }
    } else {
        // If today is not Saturday, target the next Saturday
        target = nextSaturday(now);
        target = set(target, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    }
    
    return target;
}

export function getMasterclassDateStrings() {
    const targetDate = getNextMasterclassDate();
    
    return {
        // "25th April 2026 (Saturday)"
        regularDate: format(targetDate, "do MMMM yyyy (EEEE)"),
        
        // "April 25, 2026"
        shortDate: format(targetDate, "MMMM d, yyyy"),

        // "20TH JUNE 2026"
        upperDate: format(targetDate, "do MMMM yyyy").toUpperCase()
    };
}

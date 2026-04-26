import { isAfter, isSaturday, nextSaturday, set, format } from "date-fns";

export function getNextMasterclassDate() {
    const now = new Date();
    // Candidate for this week's Saturday at 18:00 (6:00 PM) local time
    let candidate = set(now, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    
    // If today is not Saturday, move to the next instance of Saturday
    if (!isSaturday(now)) {
        candidate = nextSaturday(candidate);
    } else {
        // If today is Saturday, but it is past 6:00 PM, move to the *next* Saturday
        if (isAfter(now, candidate)) {
            candidate = nextSaturday(candidate);
        }
    }
    
    return candidate;
}

export function getMasterclassDateStrings() {
    const targetDate = getNextMasterclassDate();
    
    return {
        // "25th April 2026 (Saturday)"
        regularDate: format(targetDate, "do MMMM yyyy (EEEE)"),
        
        // "April 25, 2026"
        shortDate: format(targetDate, "MMMM d, yyyy")
    };
}

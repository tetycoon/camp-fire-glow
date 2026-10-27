import { describe, it, expect } from "vitest";
import {
    getNextWednesdaySession,
    getNextFridaySession,
    getNextSundaySession,
    getMasterclassSlots,
    getMasterclassDateStrings
} from "../lib/masterclassDateUtils";

describe("Masterclass Session Scheduling (Wed & Fri 5:30-8:30 PM & Sun 10 AM-1 PM)", () => {
    it("correctly identifies today's Wednesday session if before 5:30 PM", () => {
        // Wednesday, October 21, 2026 at 11:00 AM
        const now = new Date(2026, 9, 21, 11, 0, 0);
        const wed = getNextWednesdaySession(now);
        expect(wed.getFullYear()).toBe(2026);
        expect(wed.getMonth()).toBe(9); // October
        expect(wed.getDate()).toBe(21);
        expect(wed.getHours()).toBe(17);
        expect(wed.getMinutes()).toBe(30);
    });

    it("rolls over to next Wednesday if current time is after 5:30 PM on Wednesday", () => {
        // Wednesday, October 21, 2026 at 6:00 PM (18:00)
        const now = new Date(2026, 9, 21, 18, 0, 0);
        const wed = getNextWednesdaySession(now);
        expect(wed.getDate()).toBe(28); // Next week
        expect(wed.getHours()).toBe(17);
        expect(wed.getMinutes()).toBe(30);
    });

    it("correctly identifies upcoming Friday session at 5:30 PM", () => {
        // Wednesday, October 21, 2026 at 11:00 AM
        const now = new Date(2026, 9, 21, 11, 0, 0);
        const fri = getNextFridaySession(now);
        expect(fri.getDate()).toBe(23);
        expect(fri.getHours()).toBe(17);
        expect(fri.getMinutes()).toBe(30);
    });

    it("correctly targets upcoming Sunday at 10:00 AM from a Wednesday", () => {
        const now = new Date(2026, 9, 21, 11, 0, 0);
        const sun = getNextSundaySession(now);
        expect(sun.getDate()).toBe(25);
        expect(sun.getHours()).toBe(10);
        expect(sun.getMinutes()).toBe(0);
    });

    it("rolls over to next Sunday if current time is after 10:00 AM on Sunday", () => {
        // Sunday, October 25, 2026 at 11:00 AM
        const now = new Date(2026, 9, 25, 11, 0, 0);
        const sun = getNextSundaySession(now);
        expect(sun.getDate()).toBe(1); // November 1st
        expect(sun.getMonth()).toBe(10);
        expect(sun.getHours()).toBe(10);
    });

    it("orders slots by nearest session date across Wednesday, Friday, and Sunday", () => {
        // On a Thursday (Oct 22, 2026): Friday Oct 23 comes first, then Sunday Oct 25, then Wednesday Oct 28
        const nowThursday = new Date(2026, 9, 22, 10, 0, 0);
        const slots = getMasterclassSlots(nowThursday);
        expect(slots.nextSession.id).toBe("friday");
        expect(slots.orderedSlots[0].id).toBe("friday");
        expect(slots.orderedSlots[1].id).toBe("sunday");
        expect(slots.orderedSlots[2].id).toBe("wednesday");

        // On a Monday (Oct 19, 2026): Wednesday Oct 21 comes first, then Friday Oct 23, then Sunday Oct 25
        const nowMonday = new Date(2026, 9, 19, 10, 0, 0);
        const mondaySlots = getMasterclassSlots(nowMonday);
        expect(mondaySlots.nextSession.id).toBe("wednesday");
        expect(mondaySlots.orderedSlots[0].id).toBe("wednesday");
        expect(mondaySlots.orderedSlots[1].id).toBe("friday");
        expect(mondaySlots.orderedSlots[2].id).toBe("sunday");
    });

    it("provides complete timing and labeling metadata in slot objects", () => {
        const { nextSession, wednesdaySlot, fridaySlot, sundaySlot } = getMasterclassDateStrings();
        expect(wednesdaySlot.timeSlot).toBe("5:30 PM – 8:30 PM IST");
        expect(wednesdaySlot.dayName).toBe("Wednesday");
        expect(fridaySlot.timeSlot).toBe("5:30 PM – 8:30 PM IST");
        expect(fridaySlot.dayName).toBe("Friday");
        expect(sundaySlot.timeSlot).toBe("10:00 AM – 1:00 PM IST");
        expect(sundaySlot.dayName).toBe("Sunday");
        expect(nextSession).toBeDefined();
    });
});

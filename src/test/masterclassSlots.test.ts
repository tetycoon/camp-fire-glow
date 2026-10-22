import { describe, it, expect } from "vitest";
import {
    getNextWednesdaySession,
    getNextSundaySession,
    getMasterclassSlots,
    getMasterclassDateStrings
} from "../lib/masterclassDateUtils";

describe("Masterclass Session Scheduling (Wednesday 6-9 PM & Sunday 10 AM-1 PM)", () => {
    it("correctly identifies today's Wednesday session if before 6:00 PM", () => {
        // Wednesday, October 21, 2026 at 11:00 AM
        const now = new Date(2026, 9, 21, 11, 0, 0);
        const wed = getNextWednesdaySession(now);
        expect(wed.getFullYear()).toBe(2026);
        expect(wed.getMonth()).toBe(9); // October
        expect(wed.getDate()).toBe(21);
        expect(wed.getHours()).toBe(18);
        expect(wed.getMinutes()).toBe(0);
    });

    it("rolls over to next Wednesday if current time is after 6:00 PM on Wednesday", () => {
        // Wednesday, October 21, 2026 at 6:30 PM (18:30)
        const now = new Date(2026, 9, 21, 18, 30, 0);
        const wed = getNextWednesdaySession(now);
        expect(wed.getDate()).toBe(28); // Next week
        expect(wed.getHours()).toBe(18);
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

    it("orders slots by nearest session date", () => {
        // On a Thursday (Oct 22, 2026): Sunday Oct 25 comes BEFORE Wednesday Oct 28
        const nowThursday = new Date(2026, 9, 22, 10, 0, 0);
        const slots = getMasterclassSlots(nowThursday);
        expect(slots.nextSession.id).toBe("sunday");
        expect(slots.orderedSlots[0].id).toBe("sunday");
        expect(slots.orderedSlots[1].id).toBe("wednesday");

        // On a Monday (Oct 19, 2026): Wednesday Oct 21 comes BEFORE Sunday Oct 25
        const nowMonday = new Date(2026, 9, 19, 10, 0, 0);
        const mondaySlots = getMasterclassSlots(nowMonday);
        expect(mondaySlots.nextSession.id).toBe("wednesday");
        expect(mondaySlots.orderedSlots[0].id).toBe("wednesday");
        expect(mondaySlots.orderedSlots[1].id).toBe("sunday");
    });

    it("provides complete timing and labeling metadata in slot objects", () => {
        const { nextSession, wednesdaySlot, sundaySlot } = getMasterclassDateStrings();
        expect(wednesdaySlot.timeSlot).toBe("6:00 PM – 9:00 PM IST");
        expect(wednesdaySlot.dayName).toBe("Wednesday");
        expect(sundaySlot.timeSlot).toBe("10:00 AM – 1:00 PM IST");
        expect(sundaySlot.dayName).toBe("Sunday");
        expect(nextSession).toBeDefined();
    });
});

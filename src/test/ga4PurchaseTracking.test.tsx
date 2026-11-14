import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ThankYou from "../pages/ThankYou";
import * as gstUtils from "../lib/gstUtils";

describe("GA4 Purchase Event Tracking & Deduplication Suite", () => {
  let gtagSpy: ReturnType<typeof vi.fn>;
  let fbqSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    gtagSpy = vi.fn();
    fbqSpy = vi.fn();
    (window as any).gtag = gtagSpy;
    (window as any).fbq = fbqSpy;
  });

  afterEach(() => {
    delete (window as any).gtag;
    delete (window as any).fbq;
    vi.restoreAllMocks();
  });

  it("1. Fires GA4 purchase event with verified amount, currency INR, transaction_id, and items (no PII)", async () => {
    const verifiedRecord: gstUtils.InvoicePrintParams = gstUtils.registerVerifiedInvoiceRecord({
      customerName: "Antony Praveen",
      customerEmail: "antony@example.com",
      customerPhone: "+919876543210",
      courseName: "AI Secrets Revealed Masterclass",
      totalAmountPaid: 117,
      baseAmount: 99.15,
      paymentId: "pay_Verified123456",
      orderId: "order_Verified123456",
    });

    vi.spyOn(gstUtils, "fetchVerifiedInvoiceFromBackend").mockResolvedValue(verifiedRecord);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/thank-you",
            state: {
              paymentId: "pay_Verified123456",
              orderId: "order_Verified123456",
              token: "1793169798000.verified_signature_mock",
              alreadyTrackedPurchase: false,
            },
          },
        ]}
      >
        <Routes>
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(gtagSpy).toHaveBeenCalledWith("event", "purchase", expect.any(Object));
    });

    const purchasePayload = gtagSpy.mock.calls.find(
      (call) => call[0] === "event" && call[1] === "purchase"
    )[2];

    expect(purchasePayload.transaction_id).toBe("pay_Verified123456");
    expect(purchasePayload.value).toBe(117);
    expect(purchasePayload.currency).toBe("INR");
    expect(purchasePayload.items).toEqual([
      {
        item_id: "order_Verified123456",
        item_name: "AI Secrets Revealed Masterclass",
        price: 117,
        quantity: 1,
      },
    ]);

    // STRICT PII CHECK: Ensure no name, email, or phone are in the payload
    expect(purchasePayload.customerName).toBeUndefined();
    expect(purchasePayload.customerEmail).toBeUndefined();
    expect(purchasePayload.customerPhone).toBeUndefined();
    expect(JSON.stringify(purchasePayload)).not.toContain("Antony Praveen");
    expect(JSON.stringify(purchasePayload)).not.toContain("antony@example.com");
    expect(JSON.stringify(purchasePayload)).not.toContain("+919876543210");

    // Also verify Meta Pixel Purchase fired alongside GA4
    expect(fbqSpy).toHaveBeenCalledWith("track", "Purchase", {
      content_name: "AI Secrets Revealed Masterclass",
      currency: "INR",
      value: 117,
    });
  });

  it("2. Accurately reports ₹1 test payment without hardcoding ₹99 or ₹117", async () => {
    const testRecord: gstUtils.InvoicePrintParams = gstUtils.registerVerifiedInvoiceRecord({
      customerName: "QA Tester",
      customerEmail: "antony@aitycoon.in",
      customerPhone: "+919999999999",
      courseName: "AI Secrets Revealed Masterclass",
      totalAmountPaid: 1, // ₹1 test payment
      baseAmount: 1,
      paymentId: "pay_Test0011223344",
      orderId: "order_Test0011223344",
    });

    vi.spyOn(gstUtils, "fetchVerifiedInvoiceFromBackend").mockResolvedValue(testRecord);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/thank-you",
            state: {
              paymentId: "pay_Test0011223344",
              orderId: "order_Test0011223344",
              token: "1793169798000.verified_test_mock",
              alreadyTrackedPurchase: false,
            },
          },
        ]}
      >
        <Routes>
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(gtagSpy).toHaveBeenCalledWith("event", "purchase", expect.any(Object));
    });

    const purchasePayload = gtagSpy.mock.calls.find(
      (call) => call[0] === "event" && call[1] === "purchase"
    )[2];

    expect(purchasePayload.value).toBe(1);
    expect(purchasePayload.items[0].price).toBe(1);
  });

  it("3. Deduplication: Does NOT fire duplicate purchase event on page refresh or if already tracked in modal", async () => {
    const verifiedRecord: gstUtils.InvoicePrintParams = gstUtils.registerVerifiedInvoiceRecord({
      customerName: "Jane Doe",
      courseName: "AI Secrets Revealed Masterclass",
      totalAmountPaid: 99,
      paymentId: "pay_Dedup123456",
      orderId: "order_Dedup123456",
    });

    vi.spyOn(gstUtils, "fetchVerifiedInvoiceFromBackend").mockResolvedValue(verifiedRecord);

    // Simulate scenario where modal already tracked purchase
    sessionStorage.setItem("purchase_tracked_pay_Dedup123456", "true");

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/thank-you",
            state: {
              paymentId: "pay_Dedup123456",
              orderId: "order_Dedup123456",
              token: "1793169798000.verified_dedup_mock",
              alreadyTrackedPurchase: true,
            },
          },
        ]}
      >
        <Routes>
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for component to mount and finish verifying
    await waitFor(() => {
      expect(screen.getByText(/Payment Successful!/i)).toBeInTheDocument();
    });

    // Neither GA4 nor Meta Pixel purchase should be called because it was already tracked
    expect(gtagSpy).not.toHaveBeenCalledWith("event", "purchase", expect.any(Object));
    expect(fbqSpy).not.toHaveBeenCalledWith("track", "Purchase", expect.any(Object));
  });

  it("4. Unverified / Tampered access: Does NOT fire purchase event when payment is not verified", async () => {
    render(
      <MemoryRouter initialEntries={["/thank-you?paid=true&amount=5899&name=FakeHacker"]}>
        <Routes>
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("unverified-invoice-guard")).toBeInTheDocument();
    });

    // Must NEVER fire purchase event for unverified visits
    expect(gtagSpy).not.toHaveBeenCalledWith("event", "purchase", expect.any(Object));
    expect(fbqSpy).not.toHaveBeenCalledWith("track", "Purchase", expect.any(Object));
  });
});

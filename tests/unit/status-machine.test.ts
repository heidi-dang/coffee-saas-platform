import { describe, expect, it } from "vitest";
import { canTransition, isValidStatus, getAllowedTransitions, getActiveStatuses } from "@/lib/orders/status-machine";

describe("Order Status Machine", () => {
  it("allows NEW to ACCEPTED", () => {
    expect(canTransition("NEW", "ACCEPTED")).toBe(true);
  });

  it("allows NEW to CANCELLED", () => {
    expect(canTransition("NEW", "CANCELLED")).toBe(true);
  });

  it("blocks NEW to PREPARING", () => {
    expect(canTransition("NEW", "PREPARING")).toBe(false);
  });

  it("blocks NEW to COMPLETED", () => {
    expect(canTransition("NEW", "COMPLETED")).toBe(false);
  });

  it("allows ACCEPTED to PREPARING", () => {
    expect(canTransition("ACCEPTED", "PREPARING")).toBe(true);
  });

  it("allows PREPARING to READY", () => {
    expect(canTransition("PREPARING", "READY")).toBe(true);
  });

  it("allows READY to COMPLETED", () => {
    expect(canTransition("READY", "COMPLETED")).toBe(true);
  });

  it("blocks COMPLETED to anything", () => {
    expect(getAllowedTransitions("COMPLETED")).toEqual([]);
  });

  it("blocks CANCELLED to anything", () => {
    expect(getAllowedTransitions("CANCELLED")).toEqual([]);
  });

  it("validates valid statuses", () => {
    expect(isValidStatus("NEW")).toBe(true);
    expect(isValidStatus("COMPLETED")).toBe(true);
    expect(isValidStatus("INVALID")).toBe(false);
  });

  it("returns active statuses", () => {
    const active = getActiveStatuses();
    expect(active).toContain("NEW");
    expect(active).toContain("ACCEPTED");
    expect(active).toContain("PREPARING");
    expect(active).toContain("READY");
    expect(active).not.toContain("COMPLETED");
    expect(active).not.toContain("CANCELLED");
  });
});

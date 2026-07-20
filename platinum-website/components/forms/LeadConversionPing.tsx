"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires generate_lead exactly once per submission (brief §13):
 * sessionStorage guards against refresh double-counting.
 */
export function LeadConversionPing() {
  useEffect(() => {
    const key = "platinum_lead_tracked";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    track({ name: "generate_lead", params: { lead_type: "consultation", source: "lead_form" } });
  }, []);
  return null;
}

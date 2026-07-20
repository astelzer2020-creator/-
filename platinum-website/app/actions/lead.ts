"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isRateLimited } from "@/lib/rate-limit";
import {
  leadSchema,
  type LeadFormState,
  type LeadFieldErrors,
  type LeadInput,
} from "@/lib/validation";

interface StoredLead extends Omit<LeadInput, "company_website"> {
  id: string;
  receivedAt: string;
  source: { path: string | null; utm: Record<string, string> };
}

/**
 * Lead delivery. The success state is truthful (brief §13): we only
 * redirect to the thank-you page after the lead has been durably
 * handed off — webhook delivery when LEAD_WEBHOOK_URL is configured,
 * otherwise persisted to var/leads/ on the server. If both fail, the
 * user sees an error and their input is preserved.
 */
async function deliverLead(lead: StoredLead): Promise<boolean> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.LEAD_WEBHOOK_TOKEN
            ? { "X-Lead-Token": process.env.LEAD_WEBHOOK_TOKEN }
            : {}),
        },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return true;
      console.error(`[lead-delivery] webhook responded ${res.status} for lead ${lead.id}`);
    } catch (err) {
      console.error(`[lead-delivery] webhook failed for lead ${lead.id}`, err);
    }
  }

  // Fallback: persist locally so no lead is silently lost.
  try {
    const dir = path.join(process.cwd(), "var", "leads");
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, `${lead.receivedAt.replace(/[:.]/g, "-")}-${lead.id}.json`),
      JSON.stringify(lead, null, 2),
      "utf-8",
    );
    if (webhookUrl) {
      // Webhook failed but the lead is saved — raise an ops alert signal.
      console.error(`[lead-delivery] ALERT: lead ${lead.id} saved locally after webhook failure — manual follow-up required`);
    }
    return true;
  } catch (err) {
    console.error(`[lead-delivery] ALERT: could not persist lead ${lead.id}`, err);
    return false;
  }
}

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    projectType: formData.get("projectType"),
    projectLocation: formData.get("projectLocation"),
    desiredStart: formData.get("desiredStart") || undefined,
    message: formData.get("message"),
    referralSource: formData.get("referralSource") || undefined,
    company_website: formData.get("company_website") || undefined,
  };

  const parsed = leadSchema.safeParse(raw);

  const echoValues = Object.fromEntries(
    Object.entries(raw).filter(
      ([k, v]) => typeof v === "string" && k !== "company_website",
    ),
  ) as LeadFormState["values"];

  if (isRateLimited(`lead:${ip}`)) {
    return {
      status: "error",
      formError:
        "Too many requests from this connection. Please wait a few minutes and try again.",
      values: echoValues,
    };
  }

  if (!parsed.success) {
    const fieldErrors: LeadFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof LeadInput | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      fieldErrors,
      formError: "Please review the highlighted fields. Your entries are still here.",
      values: echoValues,
    };
  }

  // Honeypot tripped: pretend success without storing anything.
  if (parsed.data.company_website && parsed.data.company_website.length > 0) {
    redirect("/contact/thank-you");
  }

  const { company_website: _honeypot, ...leadFields } = parsed.data;

  const lead: StoredLead = {
    ...leadFields,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    source: {
      path: headerList.get("referer"),
      utm: {},
    },
  };

  const delivered = await deliverLead(lead);

  if (!delivered) {
    return {
      status: "error",
      formError:
        "We could not submit your request. Your entries are still here. Please try again in a moment.",
      values: echoValues,
    };
  }

  redirect("/contact/thank-you");
}

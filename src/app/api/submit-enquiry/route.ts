import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "soulcarspakistan@gmail.com";
// Must be an address on a domain verified in Resend, otherwise delivery is
// restricted to the Resend account owner only. Falls back to the sandbox sender.
const FROM_EMAIL = process.env.RESEND_FROM || "SoulCars <onboarding@resend.dev>";

// Only use the customer's email as replyTo if it's actually a valid address —
// a malformed value makes Resend reject the whole send, so the admin would
// never get notified. The email field on the enquiry form is optional.
const validReplyTo = (email?: string) =>
  email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? email.trim() : undefined;

type Payload = {
  type: "car" | "part";
  itemName: string;
  itemDetails?: string;
  itemUrl?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
};

export async function POST(req: Request) {
  const data = (await req.json()) as Payload;

  const heading =
    data.type === "car" ? "New Buy Request — SoulCars.pk" : "New Part Enquiry — SoulCars.pk";
  const subject =
    data.type === "car" ? `Buy Request: ${data.itemName}` : `Part Enquiry: ${data.itemName}`;

  const html = `
    <h2 style="font-family:serif;margin-bottom:24px">${heading}</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
      <tr style="background:#f5f5f5"><th style="padding:8px 12px;text-align:left">Field</th><th style="padding:8px 12px;text-align:left">Value</th></tr>
      ${[
        [data.type === "car" ? "Car" : "Part", data.itemName],
        ...(data.itemDetails ? [["Details", data.itemDetails]] : []),
        ["Name", data.name],
        ["Phone", data.phone],
        ...(data.email ? [["Email", data.email]] : []),
        ...(data.itemUrl ? [["Listing URL", data.itemUrl]] : []),
      ]
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${v || "—"}</td></tr>`,
        )
        .join("")}
    </table>
    ${data.message ? `<p style="margin-top:24px;font-family:sans-serif;font-size:14px"><strong>Message:</strong><br>${data.message}</p>` : ""}
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: validReplyTo(data.email),
      subject,
      html,
    });
    console.log("Resend enquiry result:", JSON.stringify(result));
    if (result.error) {
      console.error("Resend enquiry returned an error:", result.error);
      return NextResponse.json(
        { ok: false, error: result.error.message || "Failed to send" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend enquiry error:", err);
    return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 500 });
  }
}

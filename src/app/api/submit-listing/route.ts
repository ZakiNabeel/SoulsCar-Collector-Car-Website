import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "soulcarspakistan@gmail.com";
// Must be an address on a domain verified in Resend, otherwise delivery is
// restricted to the Resend account owner only. Falls back to the sandbox sender.
const FROM_EMAIL = process.env.RESEND_FROM || "SoulCars <onboarding@resend.dev>";

// Only use the seller's email as replyTo if it's a valid address — a malformed
// value makes Resend reject the whole send.
const validReplyTo = (email?: string) =>
  email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? email.trim() : undefined;

export async function POST(req: Request) {
  const formData = await req.formData();

  const fields = {
    make: formData.get("make") as string,
    model: formData.get("model") as string,
    year: formData.get("year") as string,
    mileage: formData.get("mileage") as string,
    engine: formData.get("engine") as string,
    transmission: formData.get("transmission") as string,
    condition: formData.get("condition") as string,
    notes: formData.get("notes") as string,
    price: formData.get("price") as string,
    city: formData.get("city") as string,
    name: formData.get("sellerName") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
  };

  const photoFiles = formData.getAll("photos") as File[];
  const attachments: { filename: string; content: Buffer }[] = [];

  for (const file of photoFiles) {
    if (file.size === 0) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    attachments.push({ filename: file.name, content: buffer });
  }

  const html = `
    <h2 style="font-family:serif;margin-bottom:24px">New Car Listing — SoulCars.pk</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
      <tr style="background:#f5f5f5"><th style="padding:8px 12px;text-align:left">Field</th><th style="padding:8px 12px;text-align:left">Value</th></tr>
      ${[
        ["Make", fields.make],
        ["Model", fields.model],
        ["Year", fields.year],
        ["Mileage", fields.mileage],
        ["Engine", fields.engine],
        ["Transmission", fields.transmission],
        ["Condition", fields.condition],
        ["Asking Price", fields.price],
        ["City", fields.city],
        ["Seller Name", fields.name],
        ["Phone", fields.phone],
        ["Email", fields.email],
      ]
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${v || "—"}</td></tr>`,
        )
        .join("")}
    </table>
    ${fields.notes ? `<p style="margin-top:24px;font-family:sans-serif;font-size:14px"><strong>Notes:</strong><br>${fields.notes}</p>` : ""}
    <p style="margin-top:24px;font-family:sans-serif;font-size:12px;color:#999">${attachments.length} photo(s) attached.</p>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: validReplyTo(fields.email),
      subject: `New Listing: ${fields.year} ${fields.make} ${fields.model}`,
      html,
      attachments,
    });
    console.log("Resend result:", JSON.stringify(result));
    if (result.error) {
      console.error("Resend returned an error:", result.error);
      return NextResponse.json(
        { ok: false, error: result.error.message || "Failed to send email" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ ok: false, error: "Failed to send email" }, { status: 500 });
  }
}

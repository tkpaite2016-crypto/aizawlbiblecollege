import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      message,
    });

    if (dbError) throw new Error(dbError.message);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const subjectLabel = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "General Inquiry";
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Aizawl Bible College Contact <onboarding@resend.dev>",
          to: ["aizawlbiblecollege24@gmail.com"],
          subject: `New Contact Form Message: ${subjectLabel}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
              <h2 style="color: #111440; margin-bottom: 4px;">New Contact Form Submission</h2>
              <p style="color: #888; font-size: 14px; margin-top: 0;">Aizawl Bible College Website</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: bold; color: #111440;">${name}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #1e2a8a;">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Subject</td><td style="padding: 8px 0; color: #111440;">${subjectLabel}</td></tr>
              </table>
              <div style="margin-top: 20px; padding: 16px; background: white; border-radius: 6px; border-left: 4px solid #c8a847;">
                <p style="margin: 0; color: #444; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin-top: 20px; font-size: 12px; color: #aaa; text-align: center;">
                Reply directly to ${email} to respond to this message.
              </p>
            </div>
          `,
        }),
      });

      if (!emailRes.ok) {
        console.error("Resend email failed:", await emailRes.text());
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

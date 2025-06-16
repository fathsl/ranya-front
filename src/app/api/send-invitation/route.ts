import nodemailer from "nodemailer";

const GMAIL_USER = "ranyaknani39@gmail.com";
const GMAIL_PASS = "lusk tjrz locf pnmm";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export async function POST(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST",
      },
    });
  }

  try {
    const { recipientEmail, formationName, invitationLink } =
      await request.json();

    if (!recipientEmail || !formationName || !invitationLink) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // FIXED: Added sender email address in from field
    const mailOptions = {
      from: `"Formation Team" <${GMAIL_USER}>`, // Added email address here
      to: recipientEmail,
      subject: `Invitation to join ${formationName}`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; margin-bottom: 16px;">You're Invited!</h2>
            <p style="margin-bottom: 16px;">You've been invited to join the formation: <strong>${formationName}</strong></p>
            <p style="margin-bottom: 20px;">Click the link below to accept your invitation:</p>
            <a href="${invitationLink}"
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0; font-weight: 500;">
              Accept Invitation
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all;">${invitationLink}</span>
            </p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 12px;">
              This invitation was sent from Formation Team
            </p>
          </div>
        `,
      text: `You've been invited to join ${formationName}. Click this link to accept: ${invitationLink}`,
    };

    const info = await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: `Email sent to ${recipientEmail}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send email",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

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
  tls: {
    rejectUnauthorized: false,
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
    const { recipientEmail, recipientName, password, formationName } =
      await request.json();

    if (!recipientEmail || !recipientName || !password || !formationName) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const mailOptions = {
      from: `"Formation Team" <${GMAIL_USER}>`,
      to: recipientEmail,
      subject: `Welcome to ${formationName} - Your Account Details`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px; text-align: center;">Welcome to Formation Team!</h2>
            
            <p style="margin-bottom: 16px; color: #374151;">Dear <strong>${recipientName}</strong>,</p>
            
            <p style="margin-bottom: 20px; color: #374151;">
              Congratulations! You have been successfully registered for the formation: <strong style="color: #2563eb;">${formationName}</strong>
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <h3 style="margin-top: 0; margin-bottom: 16px; color: #1f2937;">Your Login Credentials:</h3>
              <div style="margin-bottom: 12px;">
                <strong style="color: #374151;">Email:</strong> 
                <span style="color: #2563eb; font-family: monospace;">${recipientEmail}</span>
              </div>
              <div style="margin-bottom: 0;">
                <strong style="color: #374151;">Password:</strong> 
                <span style="color: #dc2626; font-family: monospace; background-color: #fef2f2; padding: 4px 8px; border-radius: 4px;">${password}</span>
              </div>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Important Security Notice:</strong> Please change your password after your first login for security purposes.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/login" 
                 style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Login to Your Account
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h4 style="color: #374151; margin-bottom: 12px;">Next Steps:</h4>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Log in using your credentials above</li>
                <li style="margin-bottom: 8px;">Complete your profile information</li>
                <li style="margin-bottom: 8px;">Explore your formation materials</li>
                <li>Start your learning journey!</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding: 16px; background-color: #f9fafb; border-radius: 6px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Need help? Contact our support team at 
                <a href="mailto:${GMAIL_USER}" style="color: #2563eb;">${GMAIL_USER}</a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This email was sent from Formation Team. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to Formation Team!

Dear ${recipientName},

You have been successfully registered for: ${formationName}

Your Login Credentials:
Email: ${recipientEmail}
Password: ${password}

Please log in at: ${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/login

Important: Please change your password after your first login for security purposes.

Need help? Contact us at ${GMAIL_USER}

Formation Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: `Welcome email sent to ${recipientEmail}`,
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
    console.error("Welcome email sending error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send welcome email",
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

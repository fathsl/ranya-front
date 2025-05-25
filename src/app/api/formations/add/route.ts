import { NextRequest, NextResponse } from "next/server";

interface InvitationData {
  mode: "email" | "link";
  emails: string[];
  linkGenerated: boolean;
  csvFile: File | null;
}

interface ModuleData {
  titre: string;
  resources: unknown[];
  questions: unknown[];
}

interface FormationData {
  titre: string;
  domaine: string;
  image: string;
  description: string;
  objectifs: string;
  accessType: "private" | "public";
  invitation: InvitationData;
  modules: ModuleData[];
}

export async function POST(request: NextRequest) {
  try {
    const body: FormationData = await request.json();
    console.log("body", body);

    if (!body.titre || !body.domaine || !body.description) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: titre, domaine, and description are required",
        },
        { status: 400 }
      );
    }

    if (!body.modules || body.modules.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one module is required",
        },
        { status: 400 }
      );
    }

    if (body.accessType === "private" && body.invitation.mode === "email") {
      const validEmails = body.invitation.emails.filter(
        (email) => email && email.trim() !== "" && isValidEmail(email)
      );

      if (validEmails.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "At least one valid email is required for private formations",
          },
          { status: 400 }
        );
      }
    }

    console.log("Making request to NestJS backend...");
    const nestjsResponse = await fetch(`http://localhost:3001/formations/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const nestjsData = await nestjsResponse.json();
    console.log("nest", nestjsData);

    if (!nestjsResponse.ok) {
      return NextResponse.json(nestjsData, { status: nestjsResponse.status });
    }

    return NextResponse.json(nestjsData, { status: nestjsResponse.status });
  } catch (error) {
    console.error("Error calling NestJS formations controller:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to backend service",
        },
        { status: 503 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = [
      "titre",
      "domaine",
      "description",
      "objectifs",
      "formateurId",
    ];
    const missingFields = requiredFields.filter(
      (field) =>
        !body[field] || typeof body[field] !== "string" || !body[field].trim()
    );
    console.log("body", body);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing or invalid required fields: ${missingFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    if (body.invitation) {
      if (!body.invitation.mode) {
        return NextResponse.json(
          {
            success: false,
            message: "Invitation mode is required when invitation is provided",
          },
          { status: 400 }
        );
      }
      if (
        body.invitation.mode === "email" &&
        (!Array.isArray(body.invitation.emails) ||
          body.invitation.emails.length === 0)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "At least one email is required for email invitation mode",
          },
          { status: 400 }
        );
      }
    }

    const nestjsResponse = await fetch(`http://localhost:3001/formations/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const nestjsData = await nestjsResponse.json();

    if (!nestjsResponse.ok) {
      console.error("NestJS error response:", nestjsData);
      return NextResponse.json(nestjsData, { status: nestjsResponse.status });
    }

    return NextResponse.json(nestjsData, { status: nestjsResponse.status });
  } catch (error) {
    console.error("Error in /api/formations:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { success: false, message: "Unable to connect to backend service" },
        { status: 503 }
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

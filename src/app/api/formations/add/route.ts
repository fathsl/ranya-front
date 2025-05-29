import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = JSON.parse(formData.get("data") as string);
    const csvFile = formData.get("csvFile") as File | null;

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

    const payload = new FormData();
    payload.append("data", JSON.stringify(body));
    if (csvFile) {
      payload.append("csvFile", csvFile);
    }

    const nestjsResponse = await fetch(`http://localhost:3001/formations/add`, {
      method: "POST",
      body: payload,
    });

    const nestjsData = await nestjsResponse.json();

    if (!nestjsResponse.ok) {
      console.error("NestJS error response:", nestjsData);
      return NextResponse.json(nestjsData, { status: nestjsResponse.status });
    }

    return NextResponse.json(nestjsData, { status: nestjsResponse.status });
  } catch (error) {
    console.error("Error in /api/formations/add:", error);
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

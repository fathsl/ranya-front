import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.mode || !body.formationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: mode and formationId are required",
        },
        { status: 400 }
      );
    }

    if (body.mode === "email" && (!body.emails || body.emails.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one valid email is required for email mode",
        },
        { status: 400 }
      );
    }

    const nestjsResponse = await fetch(
      `http://127.0.0.1:3001/invitations/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const nestjsData = await nestjsResponse.json();

    if (!nestjsResponse.ok) {
      return NextResponse.json(nestjsData, { status: nestjsResponse.status });
    }

    return NextResponse.json(nestjsData, { status: nestjsResponse.status });
  } catch (error) {
    console.error("Error calling NestJS invitations controller:", error);

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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

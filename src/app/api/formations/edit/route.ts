import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "Formation ID is required" },
        { status: 400 }
      );
    }

    // Prepare the data to send to NestJS backend
    const formationData = {
      ...body,
      // Ensure image field is included
      image: body.image || null,
    };

    const nestjsResponse = await fetch(
      `http://127.0.0.1:3001/formations/update`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formationData),
      }
    );

    const nestjsData = await nestjsResponse.json();

    if (!nestjsResponse.ok) {
      return NextResponse.json(nestjsData, { status: nestjsResponse.status });
    }

    return NextResponse.json(nestjsData, { status: nestjsResponse.status });
  } catch (error) {
    console.error("Error calling NestJS formations update controller:", error);

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

// GET endpoint to fetch formation data for editing
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Formation ID is required" },
        { status: 400 }
      );
    }

    const nestjsResponse = await fetch(
      `http://127.0.0.1:3001/formations/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const nestjsData = await nestjsResponse.json();

    if (!nestjsResponse.ok) {
      return NextResponse.json(nestjsData, { status: nestjsResponse.status });
    }

    return NextResponse.json(nestjsData, { status: nestjsResponse.status });
  } catch (error) {
    console.error("Error fetching formation:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { success: false, message: "Unable to connect to backend service" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

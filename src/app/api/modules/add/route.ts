import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.titre || !body.formationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and Formation ID are required",
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `http://localhost:3001/modules/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          titre: body.titre,
          formationId: body.formationId,
          order: body.order || 0,
          description: body.description || "",
          duration: body.duration || 0,
          resources: body.resources || [],
          questions: body.questions || [],
        }),
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to create module",
          error: errorData.error,
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: "Module created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error creating module:", error);

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

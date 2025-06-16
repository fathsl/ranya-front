import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formationId, moduleId, questions } = body;

    if (!formationId || !moduleId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        {
          success: false,
          message: "Formation ID, Module ID, and questions array are required",
        },
        { status: 400 }
      );
    }

    for (const question of questions) {
      if (
        !question.question ||
        !question.options ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        typeof question.correctAnswer !== "number"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each question must have a question text, 4 options, and a correct answer index",
          },
          { status: 400 }
        );
      }
    }

    const nestjsResponse = await fetch(`http://localhost:3001/quizzes/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formationId,
        moduleId,
        questions,
      }),
    });

    const nestjsData = await nestjsResponse.json();

    if (!nestjsResponse.ok) {
      return NextResponse.json(nestjsData, { status: nestjsResponse.status });
    }

    return NextResponse.json(nestjsData, { status: nestjsResponse.status });
  } catch (error) {
    console.error("Error calling NestJS quiz controller:", error);

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

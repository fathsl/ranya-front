import { NextRequest, NextResponse } from "next/server";

interface FormateurData {
  nom: string;
  email: string;
  password: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: FormateurData = await request.json();
    console.log("body", body);

    if (!body.nom || !body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: nom, email, and password are required",
        },
        { status: 400 }
      );
    }

    if (body.nom.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Le nom doit contenir au moins 2 caractères",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format d'email invalide",
        },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Le mot de passe doit contenir au moins 6 caractères",
        },
        { status: 400 }
      );
    }

    const formateurData = {
      nom: body.nom.trim(),
      email: body.email.toLowerCase().trim(),
      password: body.password,
    };

    console.log("Making request to NestJS backend...");
    const nestjsResponse = await fetch(`http://localhost:3001/formateur/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formateurData),
    });

    const nestjsData = await nestjsResponse.json();
    console.log("nest", nestjsData);

    if (!nestjsResponse.ok) {
      if (nestjsResponse.status === 409) {
        return NextResponse.json(
          {
            success: false,
            message: "Un formateur avec cet email existe déjà",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            nestjsData.message || "Erreur lors de la création du formateur",
        },
        { status: nestjsResponse.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Formateur créé avec succès",
        data: nestjsData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error calling NestJS formateur controller:", error);

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

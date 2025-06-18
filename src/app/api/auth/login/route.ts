import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe sont requis." },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(`http://localhost:3001/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: responseData.message || "Identifiants invalides." },
        { status: backendResponse.status }
      );
    }

    const { access_token } = responseData;

    if (!access_token) {
      return NextResponse.json(
        { error: "Token manquant dans la réponse." },
        { status: 500 }
      );
    }

    const decodedToken = jwt.decode(access_token);

    if (!decodedToken || typeof decodedToken !== "object") {
      return NextResponse.json(
        { error: "Impossible de décoder le token." },
        { status: 500 }
      );
    }

    const user = {
      id: decodedToken.sub,
      email: decodedToken.email,
      role: decodedToken.role,
      name: decodedToken.name || email.split("@")[0],
      telephone: decodedToken.telephone,
      linkedInLink: decodedToken.linkedInLink,
      cv: decodedToken.cv,
      isAccepted: decodedToken.isAccepted,
      token: access_token,
    };

    return NextResponse.json(
      {
        message: "Connexion réussie.",
        user: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in login API:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: (error as Error).message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  telephone: string;
  role: string;
  linkedInLink?: string;
  cv?: string;
  isAccepted?: boolean;
}

export async function POST(request: NextRequest) {
  const data: RegisterData = await request.json();
  const {
    email,
    password,
    name,
    telephone,
    role,
    linkedInLink,
    cv,
    isAccepted,
  } = data;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, mot de passe et nom sont requis." },
      { status: 400 }
    );
  }

  const backendResponse = await fetch(`http://localhost:3001/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      name,
      telephone,
      role,
      linkedInLink,
      cv,
      isAccepted: isAccepted ?? false,
    }),
  });

  const responseData = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(
      { error: responseData.message || "Erreur lors de l'inscription." },
      { status: backendResponse.status }
    );
  }

  return NextResponse.json(
    { message: "Inscription réussie.", user: responseData },
    { status: 201 }
  );
}

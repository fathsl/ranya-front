import { NextRequest, NextResponse } from "next/server";

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role: string;
}

export async function POST(request: NextRequest) {
  const data: RegisterData = await request.json();
  const { email, password, name, role } = data;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, mot de passe et nom sont requis." },
      { status: 400 }
    );
  }

  const backendResponse = await fetch(
    `${process.env.BACKEND_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name,
        role,
      }),
    }
  );

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

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        {
          error: "Champs requis manquants",
          message: "Les champs name, email et password sont obligatoires",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          error: "Format email invalide",
          message: "Veuillez entrer une adresse email valide",
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        {
          error: "Mot de passe trop court",
          message: "Le mot de passe doit contenir au moins 6 caractères",
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["Participant", "Formateur", "Admin"];
    if (body.role && !validRoles.includes(body.role)) {
      return NextResponse.json(
        {
          error: "Rôle invalide",
          message: "Le rôle doit être Participant, Formateur ou Admin",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatus = ["active", "inactive", "suspended"];
    if (body.status && !validStatus.includes(body.status)) {
      return NextResponse.json(
        {
          error: "Statut invalide",
          message: "Le statut doit être Active, Inactive ou Suspended",
        },
        { status: 400 }
      );
    }

    // Validate telephone format if provided
    if (body.telephone && body.telephone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(body.telephone.trim())) {
        return NextResponse.json(
          {
            error: "Format téléphone invalide",
            message: "Veuillez entrer un numéro de téléphone valide",
          },
          { status: 400 }
        );
      }
    }

    // Prepare data for backend
    const userData = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password,
      telephone: body.telephone?.trim() || undefined,
      role: body.role || "participant",
      status: body.status || "active",
      hasCertificate: Boolean(body.hasCertificate),
    };

    console.log("Submitting user data:", { ...userData, password: "[HIDDEN]" });

    // Call backend API
    const response = await fetch(`http://127.0.0.1:3001/users/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Handle specific backend errors
      let errorMessage = "Erreur lors de la création de l'utilisateur";

      if (response.status === 409) {
        errorMessage = "Un utilisateur avec cette adresse email existe déjà";
      } else if (response.status === 400) {
        errorMessage = responseData.message || "Données invalides";
      } else if (response.status === 500) {
        errorMessage = "Erreur interne du serveur";
      }

      return NextResponse.json(
        {
          error: "Erreur backend",
          message: errorMessage,
          details: responseData,
        },
        { status: response.status }
      );
    }

    // Remove password from response for security
    if (responseData.password) {
      delete responseData.password;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Utilisateur créé avec succès",
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Erreur de validation",
          message: "Les données fournies ne sont pas valides",
        },
        { status: 400 }
      );
    }

    if (error.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          error: "Erreur de connexion",
          message: "Impossible de se connecter au serveur backend",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur serveur",
        message: "Une erreur interne est survenue",
      },
      { status: 500 }
    );
  }
}

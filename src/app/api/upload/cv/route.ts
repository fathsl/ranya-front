import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("cv") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Type de fichier non autorisé. Seuls les fichiers PDF, DOC et DOCX sont acceptés.",
        },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux. Taille maximale: 50MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const filename = `cv_${timestamp}${fileExtension}`;

    const cvsDir = path.join(process.cwd(), "public", "CVs");
    try {
      await mkdir(cvsDir, { recursive: true });
    } catch (error) {}

    const filePath = path.join(cvsDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json(
      {
        message: "CV téléchargé avec succès",
        filename: filename,
        path: `/CVs/${filename}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du téléchargement du CV:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement du fichier" },
      { status: 500 }
    );
  }
}

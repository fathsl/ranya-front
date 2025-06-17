import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.type || !body.moduleId) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, type, and moduleId are required",
        },
        { status: 400 }
      );
    }

    if (body.type === "table") {
      if (!body.tableData || !body.tableData.headers || !body.tableData.data) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Table data with headers and data is required for table resources",
          },
          { status: 400 }
        );
      }
    } else if (["image", "video", "document"].includes(body.type)) {
      if (!body.url && !body.fileName) {
        return NextResponse.json(
          {
            success: false,
            message: "URL or file is required for this resource type",
          },
          { status: 400 }
        );
      }
    }

    const resourceData = {
      title: body.title,
      type: body.type,
      moduleId: body.moduleId,
      ...(body.url && { url: body.url }),
      ...(body.content && { content: body.content }),
      ...(body.tableData && { tableData: body.tableData }),
      ...(body.fileName && { fileName: body.fileName }),
      ...(body.fileSize && { fileSize: body.fileSize }),
      ...(body.previewUrl && { previewUrl: body.previewUrl }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.description && { description: body.description }),
      ...(body.thumbnail && { thumbnail: body.thumbnail }),
      ...(body.duration && { duration: body.duration }),
    };

    const response = await fetch("http://127.0.0.1:3001/resources/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resourceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to create resource",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

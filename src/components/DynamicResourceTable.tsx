import {
  File,
  Image,
  PlusIcon,
  SaveIcon,
  Table,
  UploadIcon,
  Video,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import ImageUpload from "./ImageUpload";
import VideoUpload from "./VideoUpload";
import DocumentUpload from "./DocumentUpload";

const DynamicResourceTable = ({
  module,
  index,
  updateResource,
  removeResource,
  saveResource,
  savingResource,
  addResource,
}) => {
  const [showResourceCreator, setShowResourceCreator] = useState(false);
  const [resourceConfig, setResourceConfig] = useState({
    type: "document",
    title: "",
    rows: 3,
    columns: 3,
    headers: ["Column 1", "Column 2", "Column 3"],
  });

  const createEmptyTable = (rows, cols, headers) => {
    const tableData = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push("");
      }
      tableData.push(row);
    }
    return {
      headers: headers,
      data: tableData,
    };
  };

  const handleFileUpload = async (moduleIndex, resourceIndex, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "type",
      file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
        ? "image"
        : "document"
    );

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        updateResource(moduleIndex, resourceIndex, "url", result.url);
        updateResource(moduleIndex, resourceIndex, "title", file.name);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // New function to handle image changes from ImageUpload component
  const handleImageChange = (moduleIndex, resourceIndex, file, imageUrl) => {
    if (file) {
      // Store the file for upload and preview URL for display
      updateResource(moduleIndex, resourceIndex, "file", file);
      updateResource(moduleIndex, resourceIndex, "previewUrl", imageUrl);
      updateResource(moduleIndex, resourceIndex, "title", file.name);

      // Also trigger the upload
      handleFileUpload(moduleIndex, resourceIndex, file);
    } else {
      // Clear the image
      updateResource(moduleIndex, resourceIndex, "file", null);
      updateResource(moduleIndex, resourceIndex, "previewUrl", "");
      updateResource(moduleIndex, resourceIndex, "url", "");
    }
  };

  const handleResourceTypeChange = (type) => {
    setResourceConfig((prev) => ({
      ...prev,
      type: type,
      title:
        type === "table"
          ? "New Table"
          : type === "video"
          ? "New Video"
          : type === "image"
          ? "New Image"
          : "New Document",
    }));
  };

  const handleColumnCountChange = (cols) => {
    const newHeaders = [];
    for (let i = 0; i < cols; i++) {
      newHeaders.push(resourceConfig.headers[i] || `Column ${i + 1}`);
    }
    setResourceConfig((prev) => ({
      ...prev,
      columns: cols,
      headers: newHeaders,
    }));
  };

  const createResource = () => {
    let newResource;

    if (resourceConfig.type === "table") {
      const newTable = createEmptyTable(
        resourceConfig.rows,
        resourceConfig.columns,
        resourceConfig.headers
      );

      newResource = {
        title: resourceConfig.title || "New Table",
        type: "table",
        tableData: newTable,
        isSaved: false,
      };
    } else {
      newResource = {
        title: resourceConfig.title || `New ${resourceConfig.type}`,
        type: resourceConfig.type,
        url: "",
        previewUrl: "",
        file: null,
        isSaved: false,
      };
    }

    // Add the resource using the existing addResource function
    addResource(index);

    // Then update the newly added resource with our custom data
    const resourceIndex = (module.resources || []).length;
    setTimeout(() => {
      Object.keys(newResource).forEach((key) => {
        updateResource(index, resourceIndex, key, newResource[key]);
      });
    }, 0);

    // Reset form and close modal
    setResourceConfig({
      type: "document",
      title: "",
      rows: 3,
      columns: 3,
      headers: ["Column 1", "Column 2", "Column 3"],
    });
    setShowResourceCreator(false);
  };

  const updateTableCell = (
    moduleIndex,
    resourceIndex,
    rowIndex,
    colIndex,
    value
  ) => {
    const resource = module.resources[resourceIndex];
    const updatedTableData = { ...resource.tableData };
    updatedTableData.data[rowIndex][colIndex] = value;

    updateResource(moduleIndex, resourceIndex, "tableData", updatedTableData);
  };

  const updateTableHeader = (
    moduleIndex,
    resourceIndex,
    headerIndex,
    value
  ) => {
    const resource = module.resources[resourceIndex];
    const updatedTableData = { ...resource.tableData };
    updatedTableData.headers[headerIndex] = value;

    updateResource(moduleIndex, resourceIndex, "tableData", updatedTableData);
  };

  const addTableRow = (moduleIndex, resourceIndex) => {
    const resource = module.resources[resourceIndex];
    const updatedTableData = { ...resource.tableData };
    const newRow = new Array(updatedTableData.headers.length).fill("");
    updatedTableData.data.push(newRow);

    updateResource(moduleIndex, resourceIndex, "tableData", updatedTableData);
  };

  const addTableColumn = (moduleIndex, resourceIndex) => {
    const resource = module.resources[resourceIndex];
    const updatedTableData = { ...resource.tableData };

    updatedTableData.headers.push(
      `Column ${updatedTableData.headers.length + 1}`
    );

    updatedTableData.data.forEach((row) => row.push(""));

    updateResource(moduleIndex, resourceIndex, "tableData", updatedTableData);
  };

  const removeTableRow = (moduleIndex, resourceIndex, rowIndex) => {
    const resource = module.resources[resourceIndex];
    const updatedTableData = { ...resource.tableData };
    updatedTableData.data.splice(rowIndex, 1);

    updateResource(moduleIndex, resourceIndex, "tableData", updatedTableData);
  };

  const removeTableColumn = (moduleIndex, resourceIndex, colIndex) => {
    const resource = module.resources[resourceIndex];
    const updatedTableData = { ...resource.tableData };

    updatedTableData.headers.splice(colIndex, 1);

    updatedTableData.data.forEach((row) => row.splice(colIndex, 1));

    updateResource(moduleIndex, resourceIndex, "tableData", updatedTableData);
  };

  const handleVideoChange = (moduleIndex, resourceIndex, file, videoUrl) => {
    if (file) {
      updateResource(moduleIndex, resourceIndex, "file", file);
      updateResource(moduleIndex, resourceIndex, "previewUrl", videoUrl);
      updateResource(moduleIndex, resourceIndex, "title", file.name);

      handleFileUpload(moduleIndex, resourceIndex, file);
    } else {
      updateResource(moduleIndex, resourceIndex, "file", null);
      updateResource(moduleIndex, resourceIndex, "previewUrl", "");
      updateResource(moduleIndex, resourceIndex, "url", "");
    }
  };

  const handleDocumentChange = (
    moduleIndex,
    resourceIndex,
    file,
    documentUrl
  ) => {
    if (file) {
      updateResource(moduleIndex, resourceIndex, "file", file);
      updateResource(moduleIndex, resourceIndex, "previewUrl", documentUrl);
      updateResource(moduleIndex, resourceIndex, "title", file.name);

      handleFileUpload(moduleIndex, resourceIndex, file);
    } else {
      updateResource(moduleIndex, resourceIndex, "file", null);
      updateResource(moduleIndex, resourceIndex, "previewUrl", "");
      updateResource(moduleIndex, resourceIndex, "url", "");
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "video":
        return <Video size={16} className="text-red-500" />;
      case "image":
        return <Image size={16} className="text-blue-500" />;
      case "document":
        return <File size={16} className="text-gray-500" />;
      case "table":
        return <Table size={16} className="text-green-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
        <button
          onClick={() => setShowResourceCreator(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <PlusIcon size={16} />
          Add Resource
        </button>

        <label className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm cursor-pointer">
          <UploadIcon size={16} />
          Upload File
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const fileType = file.type.startsWith("video/")
                  ? "video"
                  : file.type.startsWith("image/")
                  ? "image"
                  : "document";

                addResource(index);
                handleFileUpload(index, (module.resources || []).length, file);
              }
            }}
          />
        </label>
      </div>

      {showResourceCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Resource</h3>

            <div className="space-y-4">
              {/* Resource Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: "document", label: "Document", icon: File },
                    { type: "image", label: "Image", icon: Image },
                    { type: "video", label: "Video", icon: Video },
                    { type: "table", label: "Table", icon: Table },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => handleResourceTypeChange(type)}
                      className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                        resourceConfig.type === type
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={resourceConfig.title}
                  onChange={(e) =>
                    setResourceConfig((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter resource title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Table Configuration - Only show if table is selected */}
              {resourceConfig.type === "table" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Rows
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={resourceConfig.rows}
                      onChange={(e) =>
                        setResourceConfig((prev) => ({
                          ...prev,
                          rows: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Columns
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={resourceConfig.columns}
                      onChange={(e) => {
                        const cols = parseInt(e.target.value) || 1;
                        handleColumnCountChange(cols);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Column Headers
                    </label>
                    <div className="space-y-2">
                      {resourceConfig.headers.map((header, i) => (
                        <input
                          key={i}
                          type="text"
                          value={header}
                          onChange={(e) => {
                            const newHeaders = [...resourceConfig.headers];
                            newHeaders[i] = e.target.value;
                            setResourceConfig((prev) => ({
                              ...prev,
                              headers: newHeaders,
                            }));
                          }}
                          placeholder={`Column ${i + 1}`}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={createResource}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Resource
              </button>
              <button
                onClick={() => setShowResourceCreator(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {module.resources && module.resources.length > 0 && (
        <div className="space-y-4">
          {module.resources.map((resource, resourceIndex) => (
            <div
              key={resourceIndex}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center gap-3 mb-3">
                {getResourceIcon(resource.type)}
                <input
                  type="text"
                  value={resource.title || ""}
                  onChange={(e) =>
                    updateResource(
                      index,
                      resourceIndex,
                      "title",
                      e.target.value
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
                  placeholder="Resource title"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => removeResource(index, resourceIndex)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                  >
                    <XIcon size={16} />
                  </button>
                  <button
                    onClick={() => saveResource(index, resourceIndex)}
                    disabled={savingResource === `${index}-${resourceIndex}`}
                    className={`p-2 rounded-lg transition-all ${
                      savingResource === `${index}-${resourceIndex}`
                        ? "text-gray-400 cursor-not-allowed"
                        : resource.isSaved
                        ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                        : "text-green-400 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {savingResource === `${index}-${resourceIndex}` ? (
                      <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" />
                    ) : (
                      <SaveIcon size={16} />
                    )}
                  </button>
                </div>
              </div>

              {resource.type === "table" && resource.tableData ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => addTableRow(index, resourceIndex)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      + Row
                    </button>
                    <button
                      onClick={() => addTableColumn(index, resourceIndex)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      + Column
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          {resource.tableData.headers.map(
                            (header, colIndex) => (
                              <th
                                key={colIndex}
                                className="border border-gray-300 bg-gray-50 p-2 relative group"
                              >
                                <input
                                  type="text"
                                  value={header}
                                  onChange={(e) =>
                                    updateTableHeader(
                                      index,
                                      resourceIndex,
                                      colIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-center font-semibold focus:outline-none focus:bg-white focus:shadow-sm rounded px-1"
                                />
                                {resource.tableData.headers.length > 1 && (
                                  <button
                                    onClick={() =>
                                      removeTableColumn(
                                        index,
                                        resourceIndex,
                                        colIndex
                                      )
                                    }
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                )}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {resource.tableData.data.map((row, rowIndex) => (
                          <tr key={rowIndex} className="group">
                            {row.map((cell, colIndex) => (
                              <td
                                key={colIndex}
                                className="border border-gray-300 p-2 relative"
                              >
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) =>
                                    updateTableCell(
                                      index,
                                      resourceIndex,
                                      rowIndex,
                                      colIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent focus:outline-none focus:bg-gray-50 focus:shadow-sm rounded px-1 py-1"
                                  placeholder="Enter value"
                                />
                              </td>
                            ))}
                            {resource.tableData.data.length > 1 && (
                              <td className="border border-gray-300 p-1 bg-gray-50 w-8">
                                <button
                                  onClick={() =>
                                    removeTableRow(
                                      index,
                                      resourceIndex,
                                      rowIndex
                                    )
                                  }
                                  className="w-full h-6 bg-red-500 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : resource.type === "image" ? (
                <ImageUpload
                  label="Upload Image"
                  currentImage={resource.previewUrl || resource.url || ""}
                  onImageChange={(file, imageUrl) =>
                    handleImageChange(index, resourceIndex, file, imageUrl)
                  }
                  className="w-full"
                />
              ) : resource.type === "video" ? (
                <VideoUpload
                  label="Upload Video"
                  currentVideo={resource.previewUrl || resource.url || ""}
                  onVideoChange={(file, videoUrl) =>
                    handleVideoChange(index, resourceIndex, file, videoUrl)
                  }
                  className="w-full"
                />
              ) : resource.type === "video" ? (
                <VideoUpload
                  label="Upload Video"
                  currentVideo={resource.previewUrl || resource.url || ""}
                  onVideoChange={(file, videoUrl) =>
                    handleVideoChange(index, resourceIndex, file, videoUrl)
                  }
                  className="w-full"
                />
              ) : resource.type === "document" ? (
                <DocumentUpload
                  label="Upload Document"
                  currentDocument={resource.previewUrl || resource.url || ""}
                  onDocumentChange={(file, documentUrl) =>
                    handleDocumentChange(
                      index,
                      resourceIndex,
                      file,
                      documentUrl
                    )
                  }
                  className="w-full"
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {resource.type.toUpperCase()}
                    </span>
                  </div>

                  {resource.url && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">File:</span>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm underline"
                      >
                        {resource.url.split("/").pop()}
                      </a>
                    </div>
                  )}

                  {resource.file && (
                    <div className="text-sm text-gray-500">
                      Ready to upload: {resource.file.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default DynamicResourceTable;

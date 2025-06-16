"use client";

import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  GraduationCapIcon,
  LayersIcon,
  LinkIcon,
  PlusIcon,
  SaveIcon,
  VideoIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FormationEntity {
  id: string;
  titre: string;
  description: string;
}

interface ModuleEntity {
  id: string;
  titre: string;
  description: string;
  formationId: string;
  order: number;
}

interface ResourceData {
  title: string;
  type: "video" | "pdf" | "text" | "link";
  videoLink: string;
  pdfLink: string;
  textLink: string;
  content: string;
  duration: number;
  isCompleted: boolean;
  thumbnail: string;
  description: string;
  moduleId: string;
}

const AddResourcePage = ({ onBack, onResourceAdded }) => {
  const [formations, setFormations] = useState<FormationEntity[]>([]);
  const [modules, setModules] = useState<ModuleEntity[]>([]);
  const [selectedFormationId, setSelectedFormationId] = useState("");
  const [availableModules, setAvailableModules] = useState<ModuleEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resourceData, setResourceData] = useState<ResourceData>({
    title: "",
    type: "video",
    videoLink: "",
    pdfLink: "",
    textLink: "",
    content: "",
    duration: 0,
    isCompleted: false,
    thumbnail: "",
    description: "",
    moduleId: "",
  });

  useEffect(() => {
    fetchFormations();
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedFormationId) {
      const formationModules = modules
        .filter((module) => module.formationId === selectedFormationId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setAvailableModules(formationModules);
      // Reset module selection when formation changes
      setResourceData((prev) => ({ ...prev, moduleId: "" }));
    } else {
      setAvailableModules([]);
    }
  }, [selectedFormationId, modules]);

  const fetchFormations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:3001/formations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFormations(data);
      } else {
        setError("Erreur lors du chargement des formations");
      }
    } catch (error) {
      console.error("Error fetching formations:", error);
      setError("Erreur de connexion lors du chargement des formations");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/modules", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      } else {
        setError("Erreur lors du chargement des modules");
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      setError("Erreur de connexion lors du chargement des modules");
    }
  };

  const handleInputChange = (field: keyof ResourceData, value: any) => {
    setResourceData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!resourceData.title.trim()) {
      setError("Le titre est obligatoire");
      return false;
    }
    if (!resourceData.moduleId) {
      setError("Veuillez sélectionner un module");
      return false;
    }
    if (!selectedFormationId) {
      setError("Veuillez sélectionner une formation");
      return false;
    }

    // Validate based on resource type
    switch (resourceData.type) {
      case "video":
        if (!resourceData.videoLink.trim()) {
          setError("Le lien vidéo est obligatoire pour ce type de ressource");
          return false;
        }
        break;
      case "pdf":
        if (!resourceData.pdfLink.trim()) {
          setError("Le lien PDF est obligatoire pour ce type de ressource");
          return false;
        }
        break;
      case "text":
        if (!resourceData.content.trim()) {
          setError(
            "Le contenu texte est obligatoire pour ce type de ressource"
          );
          return false;
        }
        break;
      case "link":
        if (!resourceData.textLink.trim()) {
          setError("Le lien est obligatoire pour ce type de ressource");
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:3001/resources/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resourceData),
      });

      if (!response.ok) {
        let errorMessage = "Erreur lors de la création de la ressource";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      const newResource = await response.json();
      setSuccess("Ressource créée avec succès !");

      // Reset form
      setResourceData({
        title: "",
        type: "video",
        videoLink: "",
        pdfLink: "",
        textLink: "",
        content: "",
        duration: 0,
        isCompleted: false,
        thumbnail: "",
        description: "",
        moduleId: "",
      });
      setSelectedFormationId("");

      // Call callback if provided
      if (onResourceAdded) {
        onResourceAdded(newResource);
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error creating resource:", error);
      setError(error.message || "Erreur lors de la création de la ressource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFormation = formations.find(
    (f) => f.id === selectedFormationId
  );
  const selectedModule = availableModules.find(
    (m) => m.id === resourceData.moduleId
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title="Retour"
              >
                <ArrowLeftIcon size={24} className="text-gray-600" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                <PlusIcon size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Ajouter une Ressource
                </h1>
                <p className="text-gray-600 mt-1">
                  Créez une nouvelle ressource d&apos;apprentissage
                </p>
              </div>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircleIcon size={20} className="text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircleIcon size={20} className="text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <GraduationCapIcon size={16} className="inline mr-2" />
                  Formation *
                </label>
                <select
                  value={selectedFormationId}
                  onChange={(e) => setSelectedFormationId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                >
                  <option value="">Sélectionner une formation</option>
                  {formations.map((formation) => (
                    <option key={formation.id} value={formation.id}>
                      {formation.titre}
                    </option>
                  ))}
                </select>
                {selectedFormation && (
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedFormation.description}
                  </p>
                )}
              </div>

              {/* Module Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <LayersIcon size={16} className="inline mr-2" />
                  Module *
                </label>
                <select
                  value={resourceData.moduleId}
                  onChange={(e) =>
                    handleInputChange("moduleId", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={
                    !selectedFormationId || availableModules.length === 0
                  }
                >
                  <option value="">Sélectionner un module</option>
                  {availableModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.titre}
                    </option>
                  ))}
                </select>
                {selectedModule && (
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedModule.description}
                  </p>
                )}
                {selectedFormationId && availableModules.length === 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    Aucun module disponible pour cette formation
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Titre de la ressource *
                </label>
                <input
                  type="text"
                  value={resourceData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nom de votre ressource"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type de ressource *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "video",
                      label: "Vidéo",
                      icon: VideoIcon,
                      color: "red",
                    },
                    {
                      value: "pdf",
                      label: "PDF",
                      icon: FileTextIcon,
                      color: "blue",
                    },
                    {
                      value: "text",
                      label: "Texte",
                      icon: BookOpenIcon,
                      color: "green",
                    },
                    {
                      value: "link",
                      label: "Lien",
                      icon: LinkIcon,
                      color: "purple",
                    },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = resourceData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange("type", type.value)}
                        className={`p-4 border-2 rounded-lg transition-all flex items-center gap-3 ${
                          isSelected
                            ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <ClockIcon size={16} className="inline mr-2" />
                  Durée (en minutes)
                </label>
                <input
                  type="number"
                  value={resourceData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  value={resourceData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Description de la ressource"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {resourceData.type === "video" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Lien vidéo *
                  </label>
                  <input
                    type="url"
                    value={resourceData.videoLink}
                    onChange={(e) =>
                      handleInputChange("videoLink", e.target.value)
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              {resourceData.type === "pdf" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Lien PDF *
                  </label>
                  <input
                    type="url"
                    value={resourceData.pdfLink}
                    onChange={(e) =>
                      handleInputChange("pdfLink", e.target.value)
                    }
                    placeholder="https://example.com/document.pdf"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              {resourceData.type === "link" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Lien externe *
                  </label>
                  <input
                    type="url"
                    value={resourceData.textLink}
                    onChange={(e) =>
                      handleInputChange("textLink", e.target.value)
                    }
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              {resourceData.type === "text" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Contenu texte *
                  </label>
                  <textarea
                    value={resourceData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    placeholder="Contenu de votre ressource texte"
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  URL de l&apos;image (optionnel)
                </label>
                <input
                  type="url"
                  value={resourceData.thumbnail}
                  onChange={(e) =>
                    handleInputChange("thumbnail", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resourceData.isCompleted}
                    onChange={(e) =>
                      handleInputChange("isCompleted", e.target.checked)
                    }
                    className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Marquer comme terminé
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end gap-4">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <SaveIcon size={20} />
                    Créer la ressource
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourcePage;

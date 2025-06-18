"use client";
import { useAuth } from "@/contexts/authContext";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  PlayCircleIcon,
  PlayIcon,
  TableIcon,
  TargetIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ModuleEntity {
  id: string;
  titre: string;
  description?: string;
  order: number;
  duration?: number;
  resources: ResourceEntity[];
}

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface Participant {
  id: string;
  nom: string;
  email: string;
}

interface ResourceEntity {
  id: string;
  title: string;
  type: "video" | "pdf" | "image" | "document" | "table";
  url?: string;
  content?: string;
  duration?: number;
  order: number;
  isSaved: boolean;
  thumbnail?: string;
  description?: string;
  tableData?: {
    headers: string[];
    data: string[][];
  };
  fileName?: string;
  fileSize?: number;
  previewUrl?: string;
  moduleId: string;
}

export interface Formation {
  id: string;
  titre: string;
  domaine: string;
  image?: string;
  description: string;
  objectifs: string;
  accessType: "public" | "private";
  archived: boolean;
  invitation: {
    mode: "link" | "email" | "csv";
    emails: string[];
    linkGenerated: boolean;
    csvFile?: unknown;
  };
  user: User;
  userId: string;
  modules: ModuleEntity[];
  participants: Participant[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

const FormationDetailsParticipant = () => {
  const params = useParams();
  const router = useRouter();
  const formationId = params.formationId as string;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedResources, setExpandedResources] = useState(new Set());

  const getImageUrl = (imageName: string | null | undefined) => {
    if (!imageName) return null;
    if (imageName.startsWith("http") || imageName.startsWith("/uploads/")) {
      return imageName;
    }
    return `/uploads/${imageName}`;
  };

  const currentUser = {
    id: user?.id,
    nom: user?.name,
    email: user?.email,
  };

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://127.0.0.1:3001/formations/${formationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFormation(data);

        // Check if user is already enrolled
        const isUserEnrolled = data.participants?.some(
          (p: Participant) => p.id === currentUser.id
        );
        setIsEnrolled(isUserEnrolled);
      } catch (error: any) {
        setError(error.message || "Failed to fetch formation details");
        console.error("Error fetching formation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formationId) {
      fetchFormation();
    }
  }, [formationId, currentUser.id]);

  const handleEnrollment = async () => {
    if (!currentUser.id || !formation) return;

    try {
      setEnrolling(true);
      setError(null);

      const currentParticipantIds =
        formation.participants?.map((p) => p.id) || [];
      const updatedParticipantIds = [...currentParticipantIds, currentUser.id];

      const response = await fetch(
        `http://127.0.0.1:3001/formations/${formationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantIds: updatedParticipantIds,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const updatedFormation = await response.json();
      setFormation(updatedFormation);
      setIsEnrolled(true);

      console.log("Successfully enrolled in formation!");
    } catch (error: any) {
      setError(error.message || "Failed to enroll in formation");
      console.error("Error enrolling in formation:", error);
    } finally {
      setEnrolling(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayIcon size={20} className="text-red-500" />;
      case "image":
        return <ImageIcon size={20} className="text-blue-500" />;
      case "pdf":
        return <FileTextIcon size={20} className="text-red-600" />;
      case "document":
        return <FileIcon size={20} className="text-green-600" />;
      case "table":
        return <TableIcon size={20} className="text-purple-600" />;
      default:
        return <FileIcon size={20} className="text-gray-500" />;
    }
  };

  const getTotalDuration = () => {
    if (!formation?.modules) return 0;
    return formation.modules.reduce((total, module) => {
      const moduleDuration =
        module.resources?.reduce((sum, resource) => {
          return sum + (resource.duration || 0);
        }, 0) || 0;
      return total + moduleDuration;
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url || typeof url !== "string") {
      return "";
    }

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    return url;
  };

  const isYouTubeUrl = (url: string) => {
    if (!url || typeof url !== "string") {
      return false;
    }
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleResourceExpansion = (resourceId: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedResources(newExpanded);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderResourceContent = (resource: ResourceEntity) => {
    const isExpanded = expandedResources.has(resource.id);
    if (!isExpanded) return null;

    switch (resource.type) {
      case "image":
        return (
          <div className="mt-3 p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Aperçu de l'image</h4>
              {resource.fileSize && (
                <span className="text-sm text-gray-500">
                  {formatFileSize(resource.fileSize)}
                </span>
              )}
            </div>
            <div className="flex justify-center">
              {resource.previewUrl || resource.url ? (
                <img
                  src={resource.previewUrl || resource.url}
                  alt={resource.title}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-sm border"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/600x400/CCCCCC/666666?text=Image+non+disponible";
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Aperçu non disponible</p>
                </div>
              )}
            </div>
            {resource.url && (
              <div className="mt-3 flex justify-center">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <EyeIcon size={16} />
                  Voir en taille réelle
                </a>
              </div>
            )}
          </div>
        );

      case "video":
        return (
          <div className="mt-3 p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Lecteur vidéo</h4>
              {resource.duration && (
                <span className="text-sm text-gray-500">
                  {formatDuration(resource.duration)}
                </span>
              )}
            </div>
            {resource.url ? (
              isYouTubeUrl(resource.url) ? (
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    src={getYouTubeEmbedUrl(resource.url)}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={resource.title}
                  />
                </div>
              ) : (
                <video
                  controls
                  className="w-full max-h-96 rounded-lg shadow-sm"
                  preload="metadata"
                >
                  <source src={resource.url} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              )
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Vidéo non disponible</p>
              </div>
            )}
          </div>
        );

      case "pdf":
        return (
          <div className="mt-3 p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Document PDF</h4>
              {resource.fileSize && (
                <span className="text-sm text-gray-500">
                  {formatFileSize(resource.fileSize)}
                </span>
              )}
            </div>
            {resource.url ? (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={`${resource.url}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-96"
                    title={resource.title}
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <FileTextIcon size={16} />
                    Ouvrir dans un nouvel onglet
                  </a>
                </div>
              </>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">PDF non disponible</p>
              </div>
            )}
          </div>
        );

      case "document":
        return (
          <div className="mt-3 p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Document</h4>
              <div className="flex items-center gap-3">
                {resource.fileSize && (
                  <span className="text-sm text-gray-500">
                    {formatFileSize(resource.fileSize)}
                  </span>
                )}
                {resource.fileName && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {resource.fileName.split(".").pop()?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {resource.content ? (
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {resource.content}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileIcon size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-3">
                  Contenu du document non disponible
                </p>
                {resource.fileName && (
                  <p className="text-sm text-gray-500">
                    Fichier: {resource.fileName}
                  </p>
                )}
              </div>
            )}

            {resource.url && (
              <div className="mt-3 flex justify-center">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <FileIcon size={16} />
                  Télécharger le document
                </a>
              </div>
            )}
          </div>
        );

      case "table":
        return (
          <div className="mt-3 p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Tableau de données</h4>
              {resource.tableData && (
                <span className="text-sm text-gray-500">
                  {resource.tableData.data.length} ligne
                  {resource.tableData.data.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {resource.tableData &&
            resource.tableData.headers &&
            resource.tableData.data ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      {resource.tableData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resource.tableData.data.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border border-gray-300 px-4 py-2 text-sm text-gray-600"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <TableIcon size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">
                  Données du tableau non disponibles
                </p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-600 text-center">
              Type de ressource non pris en charge: {resource.type}
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-600">
            {enrolling
              ? "Inscription en cours..."
              : "Chargement des détails..."}
          </div>
        </div>
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Erreur</div>
          <div className="text-gray-600 mb-4">
            {error || "Formation non trouvée"}
          </div>
          <button
            onClick={() => router.push("/dashboard/participant/formations")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retour aux formations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push("/dashboard/participant/formations")}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeftIcon size={20} />
            <span>Retour aux formations</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {formation.titre}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {formation.domaine}
                </span>
                <div className="flex items-center gap-1 text-gray-600">
                  <UserIcon size={16} />
                  <span className="text-sm">Par {formation.user.name}</span>
                </div>
                {isEnrolled && (
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircleIcon size={14} />
                    Inscrit
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {formation.image && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={getImageUrl(formation.image)}
                  alt={formation.titre}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {isEnrolled && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="text-green-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Inscription confirmée !
                    </h3>
                    <p className="text-green-600">
                      Vous êtes maintenant inscrit à cette formation. Vous
                      pouvez commencer l&apos;apprentissage dès maintenant.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="text-red-600">
                    <h3 className="text-lg font-semibold">Erreur</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {formation.description}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TargetIcon className="text-green-600" size={24} />
                Objectifs
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {formation.objectifs}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BookOpenIcon className="text-blue-600" size={24} />
                Modules de Formation
              </h2>

              <div className="space-y-4">
                {formation.modules
                  ?.sort((a, b) => a.order - b.order)
                  .map((module, index) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
                    >
                      <div
                        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleModuleExpansion(module.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {module.titre}
                            </h3>
                            {module.description && (
                              <p className="text-gray-600 text-sm mt-1">
                                {module.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {module.resources &&
                              module.resources.length > 0 && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {module.resources.length} ressource
                                  {module.resources.length > 1 ? "s" : ""}
                                </span>
                              )}
                            <div className="text-gray-400">
                              {expandedModules.has(module.id) ? (
                                <ChevronDownIcon size={20} />
                              ) : (
                                <ChevronRightIcon size={20} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {expandedModules.has(module.id) &&
                        module.resources &&
                        module.resources.length > 0 && (
                          <div className="border-t border-gray-200 bg-gray-50 p-4">
                            <h4 className="font-medium text-gray-700 mb-3">
                              Ressources du module:
                            </h4>
                            <div className="space-y-3">
                              {module.resources
                                .sort((a, b) => a.order - b.order)
                                .map((resource) => (
                                  <div key={resource.id} className="space-y-2">
                                    <div
                                      className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border"
                                      onClick={() =>
                                        toggleResourceExpansion(resource.id)
                                      }
                                    >
                                      {getResourceIcon(resource.type)}
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800">
                                          {resource.title}
                                        </p>
                                        {resource.description && (
                                          <p className="text-sm text-gray-600">
                                            {resource.description}
                                          </p>
                                        )}
                                        {resource.originalName && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Fichier: {resource.originalName}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {resource.duration && (
                                          <div className="flex items-center gap-1 text-gray-500">
                                            <ClockIcon size={14} />
                                            <span className="text-sm">
                                              {formatDuration(
                                                resource.duration
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        <div className="text-gray-400">
                                          {expandedResources.has(resource.id)
                                            ? "▼"
                                            : "▶"}
                                        </div>
                                      </div>
                                    </div>
                                    {renderResourceContent(resource)}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Informations
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpenIcon className="text-blue-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Modules</p>
                    <p className="font-semibold">
                      {formation.modules?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UsersIcon className="text-green-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-semibold">
                      {formation.participants?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ClockIcon className="text-orange-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Durée totale</p>
                    <p className="font-semibold">
                      {formatDuration(getTotalDuration())}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="text-purple-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Créée le</p>
                    <p className="font-semibold">
                      {new Date(formation.createdAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Formateur
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {formation.user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formation.user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Type d&apos;accès
              </h3>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  formation.accessType === "private"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {formation.accessType === "private"
                  ? "Formation Privée"
                  : "Formation Publique"}
              </span>
            </div>

            {!isEnrolled && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <button
                  onClick={handleEnrollment}
                  disabled={enrolling}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <UserIcon size={20} />
                      S&apos;inscrire à la formation
                    </>
                  )}
                </button>
              </div>
            )}

            {isEnrolled && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/participant/formations/${formationId}/learn`
                    )
                  }
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <PlayCircleIcon size={20} />
                  Commencer l&apos;apprentissage
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationDetailsParticipant;

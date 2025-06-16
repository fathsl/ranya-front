"use client";
import { useAuth } from "@/contexts/authContext";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  PlayCircleIcon,
  PlayIcon,
  TargetIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Formateur {
  id: string;
  nom: string;
  email: string;
}

interface ModuleEntity {
  id: string;
  titre: string;
}

interface Participant {
  id: string;
  nom: string;
}

interface Formation {
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
  formateur: Formateur;
  formateurId: string;
  modules: ModuleEntity[];
  participants: Participant[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Formateur {
  id: string;
  nom: string;
  email: string;
}

interface ResourceEntity {
  id: string;
  title: string;
  type: "video" | "pdf" | "text";
  videoLink?: string;
  pdfLink?: string;
  textLink?: string;
  content?: string;
  duration?: number;
  order: number;
  isCompleted: boolean;
  thumbnail?: string;
  description?: string;
}

interface ModuleEntity {
  id: string;
  titre: string;
  description?: string;
  order: number;
  duration?: number;
  resources: ResourceEntity[];
}

interface Participant {
  id: string;
  nom: string;
  email: string;
}

interface Formation {
  id: string;
  titre: string;
  domaine: string;
  image?: string;
  description: string;
  objectifs: string;
  accessType: "public" | "private";
  formateur: Formateur;
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
  const [expandedResources, setExpandedResources] = useState(new Set());

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

  // New enrollment function
  const handleEnrollment = async () => {
    if (!currentUser.id || !formation) return;

    try {
      setEnrolling(true);
      setError(null);

      // Get current participant IDs and add the current user
      const currentParticipantIds =
        formation.participants?.map((p) => p.id) || [];
      const updatedParticipantIds = [...currentParticipantIds, currentUser.id];

      const response = await fetch(
        `http://127.0.0.1:3001/formations/${formationId}`,
        {
          method: "PATCH",
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

      // Show success message or redirect
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
      default:
        return <FileIcon size={20} className="text-gray-500" />;
    }
  };

  const getTotalDuration = () => {
    if (!formation?.modules) return 0;
    return formation.modules.reduce((total) => {
      const moduleDuration =
        formation.modules?.reduce((sum, resource) => {
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

  const toggleResourceExpansion = (resourceId) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedResources(newExpanded);
  };

  const renderResourceContent = (resource) => {
    const isExpanded = expandedResources.has(resource.id);

    if (!isExpanded) return null;

    switch (resource.type) {
      case "image":
        return (
          <div className="mt-3 p-3 bg-white rounded-lg border">
            <img
              src={resource.url}
              alt={resource.title}
              className="max-w-full h-auto rounded-lg shadow-sm"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x400/CCCCCC/666666?text=Image+non+disponible";
              }}
            />
          </div>
        );

      case "video":
        return (
          <div className="mt-3 p-3 bg-white rounded-lg border">
            {resource.url && isYouTubeUrl(resource.url) ? (
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
            ) : resource.url ? (
              <video
                controls
                className="w-full max-w-2xl rounded-lg shadow-sm"
                preload="metadata"
              >
                <source src={resource.url} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
                URL de la vidéo non disponible
              </div>
            )}
          </div>
        );

      case "pdf":
        return (
          <div className="mt-3 p-3 bg-white rounded-lg border">
            <iframe
              src={resource.url}
              className="w-full h-96 rounded-lg border"
              title={resource.title}
            />
            <div className="mt-2 text-center">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileTextIcon size={16} />
                Ouvrir le PDF dans un nouvel onglet
              </a>
            </div>
          </div>
        );

      default:
        return (
          <div className="mt-3 p-3 bg-gray-100 rounded-lg border">
            <p className="text-gray-600">
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
                  <span className="text-sm">Par {formation.formateur.nom}</span>
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
                  src={formation.image}
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

            {/* Error Message */}
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

            {/* Description */}
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

              <div className="space-y-6">
                {formation.modules
                  ?.sort((a, b) => a.order - b.order)
                  .map((module, index) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {module.titre}
                          </h3>
                          {module.description && (
                            <p className="text-gray-600 mb-4">
                              {module.description}
                            </p>
                          )}

                          {module.resources && module.resources.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-700 mb-2">
                                Ressources:
                              </h4>
                              {module.resources
                                .sort((a, b) => a.order - b.order)
                                .map((resource) => (
                                  <div key={resource.id} className="space-y-2">
                                    <div
                                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
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
                                      </div>
                                      {resource.duration && (
                                        <div className="flex items-center gap-1 text-gray-500">
                                          <ClockIcon size={14} />
                                          <span className="text-sm">
                                            {formatDuration(resource.duration)}
                                          </span>
                                        </div>
                                      )}
                                      <div className="text-gray-400">
                                        {expandedResources.has(resource.id)
                                          ? "▼"
                                          : "▶"}
                                      </div>
                                    </div>

                                    {renderResourceContent(resource)}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
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
                    {formation.formateur.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formation.formateur.email}
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

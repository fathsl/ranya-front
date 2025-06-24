"use client";

import {
  AwardIcon,
  CalendarIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  PlusIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Participant {
  id: string;
  nom: string;
  email: string;
  niveau: "Débutant" | "Intermédiaire" | "Avancé";
  score: number;
  certificatObtenu: boolean;
  statusFormation: "Inscrit" | "En cours" | "Terminé" | "Annulé";
  isActive: boolean;
  createdAt: string;
  dateModification: string;
  formationId: string;
  formation?: {
    id: string;
    title: string;
  };
}

const ParticipantsPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [formationId, setFormationId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formationTitle] = useState("Formation React Avancé");

  useEffect(() => {
    if (id && typeof id === "string") {
      setFormationId(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!id) {
        setError("Formation ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://127.0.0.1:3001/formations/formation/${id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Participant[] = await response.json();
        setParticipants(data);
      } catch (error) {
        console.error("Error fetching participants:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch participants"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id]);

  const handleToggleActive = async (
    participantId: string,
    currentStatus: boolean
  ) => {
    try {
      await fetch(
        `http://127.0.0.1:3001/participants/${participantId}/toggle-active`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === participantId
            ? { ...participant, isActive: !currentStatus }
            : participant
        )
      );
    } catch (error) {
      console.error("Error updating participant status:", error);
    }
  };

  const handleUpdateStatus = async (
    participantId: string,
    newStatus: Participant["statusFormation"]
  ) => {
    try {
      await fetch(
        `http://127.0.0.1:3001/participants/${participantId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === participantId
            ? { ...participant, statusFormation: newStatus }
            : participant
        )
      );
    } catch (error) {
      console.error("Error updating participant formation status:", error);
    }
  };

  const getNiveauColor = (niveau: Participant["niveau"]) => {
    switch (niveau) {
      case "Débutant":
        return "bg-green-100 text-green-700";
      case "Intermédiaire":
        return "bg-yellow-100 text-yellow-700";
      case "Avancé":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatScore = (score: number): string => {
    if (typeof score === "number" && !isNaN(score)) {
      return score.toFixed(2);
    }
    if (typeof score === "string" && !isNaN(parseFloat(score))) {
      return parseFloat(score).toFixed(2);
    }
    return "0.00";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des participants...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
            <div className="flex items-center gap-3 mb-4">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Participants</h1>
            </div>
            <div className="flex justify-end mb-6">
              <Link
                href={`/dashboard/formateur/formations/participants/${formationId}/ajouter`}
              >
                <button className="flex flex-row bg-blue-600 text-white  px-6 py-2 rounded-md space-x-2">
                  <PlusIcon />
                  <span className="text-l font-bold">Ajouter</span>
                </button>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {formationTitle}
            </h2>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Formation ID: {formationId}</span>
              <span className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                {participants.length} participant(s)
              </span>
              <span className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                {Array.isArray(participants) ? participants.length : 0}{" "}
                participant(s)
              </span>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Inscription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut Participant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(participants) &&
                  participants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {participant.nom}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MailIcon className="h-3 w-3" />
                            {participant.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNiveauColor(
                            participant.niveau
                          )}`}
                        >
                          {participant.niveau}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <TrendingUpIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatScore(participant.score)}%
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <AwardIcon
                            className={`h-4 w-4 ${
                              participant.certificatObtenu
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              participant.certificatObtenu
                                ? "text-green-700 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {participant.certificatObtenu
                              ? "Obtenu"
                              : "Non obtenu"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(participant.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participant.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {participant.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Status Update Buttons */}
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleUpdateStatus(participant.id, "Inscrit")
                              }
                              className={`px-2 py-1 text-xs rounded ${
                                participant.statusFormation === "Inscrit"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-gray-100 text-gray-600 hover:bg-yellow-100"
                              }`}
                              title="Marquer comme Inscrit"
                            >
                              Inscrit
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(participant.id, "En cours")
                              }
                              className={`px-2 py-1 text-xs rounded ${
                                participant.statusFormation === "En cours"
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-gray-100 text-gray-600 hover:bg-blue-100"
                              }`}
                              title="Marquer comme En cours"
                            >
                              En cours
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(participant.id, "Terminé")
                              }
                              className={`px-2 py-1 text-xs rounded ${
                                participant.statusFormation === "Terminé"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-gray-100 text-gray-600 hover:bg-green-100"
                              }`}
                              title="Marquer comme Terminé"
                            >
                              Terminé
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(participant.id, "Annulé")
                              }
                              className={`px-2 py-1 text-xs rounded ${
                                participant.statusFormation === "Annulé"
                                  ? "bg-red-200 text-red-800"
                                  : "bg-gray-100 text-gray-600 hover:bg-red-100"
                              }`}
                              title="Marquer comme Annulé"
                            >
                              Annulé
                            </button>
                          </div>

                          <div className="w-px h-6 bg-gray-300"></div>

                          <button
                            onClick={() =>
                              handleToggleActive(
                                participant.id,
                                participant.isActive
                              )
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              participant.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                            title={
                              participant.isActive
                                ? "Désactiver l'accès"
                                : "Activer l'accès"
                            }
                          >
                            {participant.isActive ? (
                              <>
                                <EyeIcon className="h-4 w-4" />
                                Activer
                              </>
                            ) : (
                              <>
                                <EyeOffIcon className="h-4 w-4" />
                                Désactiver
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {(!Array.isArray(participants) || participants.length === 0) &&
          !loading && (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun participant trouvé
              </h3>
              <p className="text-gray-600">
                Cette formation n&apos;a pas encore de participants inscrits.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default ParticipantsPage;

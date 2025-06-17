"use client";

import {
  BookOpenIcon,
  Edit3Icon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export interface ModuleEntity {
  id: string;
  titre?: string;
  name?: string;
}
interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface Participant {
  id: string;
  nom?: string;
  email?: string;
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

const Formations = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://127.0.0.1:3001/formations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFormations(data);
      } catch (error: any) {
        setError(error.message || "Unknown error");
        console.error("Error fetching formations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  const handleEdit = (formationId: string) => {
    router.push(`/dashboard/formateur/formations/edit/${formationId}`);
  };

  const handleDelete = async (formationId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this formation? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:3001/formations/${formationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from local state
      setFormations(formations.filter((f) => f.id !== formationId));
    } catch (error) {
      console.error("Error deleting formation:", error);
      alert("Failed to delete formation");
    }
  };

  const handleViewParticipants = (formationId: string) => {
    router.push(`/dashboard/formateur/formations/participants/${formationId}`);
  };

  const getImageUrl = (imageName: string | null | undefined) => {
    if (!imageName) return null;

    if (imageName.startsWith("http") || imageName.startsWith("/uploads/")) {
      return imageName;
    }

    return `/uploads/${imageName}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-600">
            Loading formations...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gestion des Formations
          </h1>
          <p className="text-gray-600 text-lg">
            Gérez vos formations et leurs informations
          </p>
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <Link href={"/dashboard/formateur/formations/ajouter"}>
            <button className="flex flex-row bg-blue-600 text-white  px-6 py-2 rounded-md space-x-2">
              <PlusIcon />
              <span className="text-l font-bold">Ajouter</span>
            </button>
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <div
              key={formation.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Card Header with Image */}
              <div
                className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden"
                style={{
                  backgroundImage: formation.image
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${getImageUrl(
                        formation.image
                      )})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold mb-1 line-clamp-2">
                    {formation.titre}
                  </h3>
                  <p className="text-white/90 text-sm">
                    Par {formation.user.name}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      formation.accessType === "private"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {formation.accessType === "private" ? "Privé" : "Public"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Domain Badge */}
                <div className="mb-4">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                    {formation.domaine}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {formation.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <BookOpenIcon size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {formation.modules.length} modules
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UsersIcon size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {formation.participants.length} participants
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewParticipants(formation.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    <UsersIcon size={16} />
                    <span className="text-sm">Participants</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(formation.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Modifier"
                    >
                      <Edit3Icon size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(formation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Supprimer"
                    >
                      <Trash2Icon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {formations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpenIcon size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Aucune formation trouvée
            </h3>
            <p className="text-gray-500 mb-6">
              Commencez par créer votre première formation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Formations;

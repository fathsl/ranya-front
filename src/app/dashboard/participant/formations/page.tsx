"use client";

import { useAuth } from "@/contexts/authContext";
import {
  BookOpenIcon,
  EyeIcon,
  FilterIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}
interface ModuleEntity {
  id: string;
  titre: string;
}

interface Participant {
  id: string;
  nom: string;
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
const ParticipantFormations = () => {
  const { user } = useAuth();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
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

        const filteredFormations = data.filter((formation: Formation) => {
          if (formation.archived) return false;

          if (formation.accessType === "public") return true;

          if (formation.accessType === "private" && user?.email) {
            return formation.invitation?.emails?.includes(user.email);
          }

          return false;
        });

        setFormations(filteredFormations);
        setFilteredFormations(filteredFormations);
      } catch (error: any) {
        setError(error.message || "Unknown error");
        console.error("Error fetching formations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [user?.email]);

  // Filter formations based on domain and search term
  useEffect(() => {
    let filtered = formations;

    if (selectedDomain !== "all") {
      filtered = filtered.filter(
        (formation) => formation.domaine === selectedDomain
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (formation) =>
          formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formation.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          formation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFormations(filtered);
  }, [formations, selectedDomain, searchTerm]);

  const handleViewFormation = (formationId: string) => {
    console.log("View formation:", formationId);
    // Navigate to formation details page
    router.push(`/dashboard/participant/formations/${formationId}`);
  };

  // Get unique domains for filter
  const uniqueDomains = Array.from(new Set(formations.map((f) => f.domaine)));

  const getImageUrl = (imageName: string | null | undefined) => {
    if (!imageName) return null;

    if (imageName.startsWith("http") || imageName.startsWith("/uploads/")) {
      return imageName;
    }

    return `/uploads/${imageName}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-600">
            Chargement des formations...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Erreur</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Formations Disponibles
          </h1>
          <p className="text-gray-600 text-lg">
            Découvrez et inscrivez-vous aux formations qui vous intéressent
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher une formation, formateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Domain Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon size={20} className="text-gray-500" />
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="all">Tous les domaines</option>
                {uniqueDomains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredFormations.length} formation
            {filteredFormations.length !== 1 ? "s" : ""} trouvée
            {filteredFormations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormations.map((formation) => (
            <div
              key={formation.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => handleViewFormation(formation.id)}
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

                {/* Access Type Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      formation.accessType === "private"
                        ? "bg-orange-500 text-white"
                        : "bg-green-500 text-white"
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
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                    {formation.domaine}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {formation.description}
                </p>

                {/* Objectives Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Objectifs:
                  </h4>
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {formation.objectifs}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <BookOpenIcon size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {formation.modules.length} modules
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UsersIcon size={16} className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {formation.participants.length} inscrits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating (Mock) */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      size={14}
                      className={`${
                        star <= 4
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">(4.0)</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewFormation(formation.id);
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <EyeIcon size={16} />
                    <span className="text-sm font-medium">Voir détails</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFormations.length === 0 && formations.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpenIcon size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Aucune formation trouvée
            </h3>
            <p className="text-gray-500 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDomain("all");
              }}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Completely Empty State */}
        {formations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpenIcon size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Aucune formation disponible
            </h3>
            <p className="text-gray-500">
              Il n&apos;y a actuellement aucune formation disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantFormations;

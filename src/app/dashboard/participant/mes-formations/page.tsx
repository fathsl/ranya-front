"use client";

import { useEffect, useState } from "react";
import { Formation, Participant } from "../../formateur/formations/page";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { BookOpenIcon, EyeIcon, FilterXIcon, UsersIcon } from "lucide-react";

export default function MesFormations() {
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

        // Filter out archived formations for participants
        const activeFormations = data.filter(
          (formation: Formation) => !formation.archived
        );

        // Filter formations that the current user participates in
        const userCertificates = data.filter((formation: Formation) => {
          // Check if user exists and has an ID
          if (!user?.id || !formation.participants) return false;

          // Check if the current user is in the participants array
          return formation.participants.some(
            (participant: Participant) => participant.id === user.id
          );
        });

        setFormations(userCertificates);
        setFilteredFormations(activeFormations);
      } catch (error: any) {
        setError(error.message || "Unknown error");
        console.error("Error fetching formations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [user?.id]);
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
          formation.formateur.nom
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFormations(filtered);
  }, [formations, selectedDomain, searchTerm]);

  const handleViewFormation = (formationId: string) => {
    console.log("View formation:", formationId);
    router.push(`/dashboard/participant/formations/${formationId}`);
  };

  const uniqueDomains = Array.from(new Set(formations.map((f) => f.domaine)));

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg">
            Gérez vos formations et leurs informations
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
              <FilterXIcon size={20} className="text-gray-500" />
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
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Card Header with Image */}
              <div
                className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden"
                style={{
                  backgroundImage: formation.image
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${formation.image})`
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
                    Par {formation.formateur.nom}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      formation.archived
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {formation.archived ? "Archivé" : "Actif"}
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

                <div className="mb-4">
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

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewFormation(formation.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    <EyeIcon size={16} />
                    <span className="text-sm">Voir</span>
                  </button>
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
          </div>
        )}
      </div>
    </div>
  );
}

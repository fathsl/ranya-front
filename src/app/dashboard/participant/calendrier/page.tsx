"use client";

import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from "react";
import {
  BellIcon,
  BookOpenIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  SearchIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import ReminderDrawer from "@/components/ReminderDrawer";

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface ModuleEntity {
  id: string;
  titre?: string;
  name?: string;
  description?: string;
}

interface Participant {
  id: string;
}

export interface Formation {
  id: string;
  titre: string;
  domaine: string;
  image?: string;
  description: string;
  objectifs: string;
  startDate: Date | null;
  endDate: Date | null;
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

const FormationCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [isReminderDrawerOpen, setIsReminderDrawerOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

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

          if (formation.userId === user?.id) return true;

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
  }, [user?.id]);

  useEffect(() => {
    const filtered = formations.filter(
      (formation) =>
        formation?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        formation.user?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        formation.domaine?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFormations(filtered);
  }, [searchTerm, formations]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const calendarDays = [];
  const currentDay = new Date(startDate);

  while (currentDay <= endDate) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const isDateInFormationRange = (date: Date, formation: Formation) => {
    if (!formation.startDate || !formation.endDate) return false;

    const formationStart = new Date(formation.startDate);
    const formationEnd = new Date(formation.endDate);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    formationStart.setHours(0, 0, 0, 0);
    formationEnd.setHours(0, 0, 0, 0);

    return checkDate >= formationStart && checkDate <= formationEnd;
  };

  const getFormationPositionInfo = (date: Date, formation: Formation) => {
    if (!formation.startDate || !formation.endDate) return null;

    const formationStart = new Date(formation.startDate);
    const formationEnd = new Date(formation.endDate);
    const checkDate = new Date(date);

    checkDate.setHours(0, 0, 0, 0);
    formationStart.setHours(0, 0, 0, 0);
    formationEnd.setHours(0, 0, 0, 0);

    const isStart = checkDate.getTime() === formationStart.getTime();
    const isEnd = checkDate.getTime() === formationEnd.getTime();
    const isSingle = formationStart.getTime() === formationEnd.getTime();

    return {
      isStart,
      isEnd,
      isSingle,
      isMiddle: !isStart && !isEnd && !isSingle,
    };
  };

  const getFormationsForDate = (date: Date) => {
    return filteredFormations.filter((formation) => {
      return isDateInFormationRange(date, formation);
    });
  };

  const getFormationDuration = (formation: Formation) => {
    if (!formation.startDate || !formation.endDate) return "Non spécifié";

    const start = new Date(formation.startDate);
    const end = new Date(formation.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  };

  const formatDuration = (formation: Formation) => {
    const duration = getFormationDuration(formation);
    const moduleCount = formation.modules?.length || 0;

    if (moduleCount > 0) {
      return `${duration} • ${moduleCount} module${moduleCount > 1 ? "s" : ""}`;
    }

    return duration;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const openModal = (formation: Formation) => {
    setSelectedFormation(formation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFormation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XIcon className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Erreur</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Calendrier des Formations
              </h1>
              <p className="text-gray-600 text-lg">
                Visualisez et gérez toutes vos formations programmées
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-600">
                {filteredFormations.length} formation(s)
              </div>
            </div>
          </div>

          <div className="relative mb-6">
            <SearchIcon
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <ChevronLeftIcon size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Aujourd&apos;hui
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <ChevronRightIcon size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 bg-gray-50">
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayFormations = getFormationsForDate(day);
              const isCurrentMonth = day.getMonth() === month;
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                    !isCurrentMonth
                      ? "bg-gray-50/50 text-gray-400"
                      : "bg-white hover:bg-gray-50"
                  } transition-colors`}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isToday
                        ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayFormations.map((formation) => {
                      const positionInfo = getFormationPositionInfo(
                        day,
                        formation
                      );

                      if (!positionInfo) return null;

                      let styleClasses =
                        "text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-all truncate ";
                      let borderRadius = "";

                      if (positionInfo.isSingle) {
                        styleClasses +=
                          "bg-blue-100 text-blue-800 border-2 border-blue-300";
                        borderRadius = "rounded";
                      } else if (positionInfo.isStart) {
                        styleClasses +=
                          "bg-blue-100 text-blue-800 border-2 border-blue-300 border-r-blue-200";
                        borderRadius = "rounded-l";
                      } else if (positionInfo.isEnd) {
                        styleClasses +=
                          "bg-blue-100 text-blue-800 border-2 border-blue-300 border-l-blue-200";
                        borderRadius = "rounded-r";
                      } else {
                        styleClasses +=
                          "bg-blue-50 text-blue-700 border-t-2 border-b-2 border-blue-200";
                        borderRadius = "rounded-none";
                      }

                      return (
                        <div
                          key={formation.id}
                          onClick={() => openModal(formation)}
                          className={`${styleClasses} ${borderRadius}`}
                          title={`${formation.titre} - ${formatDuration(
                            formation
                          )}`}
                        >
                          <div className="font-medium truncate">
                            {positionInfo.isStart || positionInfo.isSingle ? (
                              <>
                                {formation.titre}
                                {positionInfo.isSingle && (
                                  <div className="text-blue-600 flex items-center gap-1 mt-1">
                                    <ClockIcon size={10} />
                                    {formatDuration(formation)}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center">•••</div>
                            )}
                          </div>
                          {positionInfo.isStart && !positionInfo.isSingle && (
                            <div className="text-blue-600 flex items-center gap-1 mt-1">
                              <ClockIcon size={10} />
                              {formatDuration(formation)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isModalOpen && selectedFormation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedFormation.titre}
                    </h2>
                    <div className="flex items-center gap-4 text-blue-100">
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={16} />
                        {selectedFormation.startDate
                          ? new Date(
                              selectedFormation.startDate
                            ).toLocaleDateString("fr-FR")
                          : "Date non définie"}
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon size={16} />
                        {formatDuration(selectedFormation.modules)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XIcon size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <UserIcon size={18} />
                        Formateur
                      </h3>
                      <p className="text-gray-600">
                        {selectedFormation.user?.name || "Non spécifié"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <UsersIcon size={18} />
                        Participants
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedFormation.participants?.length || 0}{" "}
                          inscrit(s)
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Domaine
                      </h3>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedFormation.domaine || "Non défini"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Modules
                      </h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedFormation.modules?.length || 0} module(s)
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Type d&apos;accès
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedFormation.accessType === "public"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {selectedFormation.accessType === "public"
                          ? "Public"
                          : "Privé"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Statut
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedFormation.archived
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedFormation.archived ? "Archivé" : "Actif"}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedFormation.description && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <BookOpenIcon size={18} />
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                      {selectedFormation.description}
                    </p>
                  </div>
                )}

                {selectedFormation.objectifs && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Objectifs
                    </h3>
                    <p className="text-gray-600 bg-blue-50 p-4 rounded-xl">
                      {selectedFormation.objectifs}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Informations supplémentaires
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>ID Formation:</span>
                      <span className="font-medium">
                        {selectedFormation.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formateur ID:</span>
                      <span className="font-medium">
                        {selectedFormation.userId || "Non défini"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode d&apos;invitation:</span>
                      <span className="font-medium">
                        {selectedFormation.invitation?.mode || "Non défini"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lien généré:</span>
                      <span className="font-medium">
                        {selectedFormation.invitation?.linkGenerated
                          ? "Oui"
                          : "Non"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créée le:</span>
                      <span className="font-medium">
                        {selectedFormation.createdAt
                          ? new Date(
                              selectedFormation.createdAt
                            ).toLocaleDateString("fr-FR")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modifiée le:</span>
                      <span className="font-medium">
                        {selectedFormation.updatedAt
                          ? new Date(
                              selectedFormation.updatedAt
                            ).toLocaleDateString("fr-FR")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modules List */}
                {selectedFormation.modules &&
                  selectedFormation.modules.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">
                        Modules de formation
                      </h3>
                      <div className="space-y-2">
                        {selectedFormation.modules.map((module, index) => (
                          <div
                            key={module.id || index}
                            className="bg-white border rounded-lg p-3"
                          >
                            <div className="font-medium text-gray-800">
                              Module {index + 1}:{" "}
                              {module.titre || module.name || "Sans titre"}
                            </div>
                            {module.description && (
                              <div className="text-sm text-gray-600 mt-1">
                                {module.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setIsReminderDrawerOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <BellIcon size={18} />
                      Envoyer un rappel
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Fermer
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                  Modifier la formation
                </button>
              </div>
            </div>
          </div>
        )}
        <ReminderDrawer
          isOpen={isReminderDrawerOpen}
          onClose={() => setIsReminderDrawerOpen(false)}
          formation={selectedFormation}
        />
      </div>
    </div>
  );
};

export default FormationCalendar;

"use client";

import {
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  Edit3Icon,
  FileTextIcon,
  FolderIcon,
  GraduationCapIcon,
  LayersIcon,
  LinkIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

interface ResourceEntity {
  id: string;
  title: string;
  type: string;
  videoLink?: string;
  pdfLink?: string;
  textLink?: string;
  content?: string;
  duration?: number;
  isCompleted: boolean;
  thumbnail?: string;
  description?: string;
  moduleId: string;
  module: ModuleEntity;
  createdAt: string;
  updatedAt: string;
}

interface ModuleEntity {
  id: string;
  titre: string;
  description?: string;
  formationId: string;
  duration?: number;
  order: number;
  formation: FormationEntity;
  resources: ResourceEntity[];
  createdAt: string;
  updatedAt: string;
}

interface FormationEntity {
  id: string;
  titre: string;
  description?: string;
  modules: ModuleEntity[];
  createdAt: string;
  updatedAt: string;
}

interface EditResourceData {
  title: string;
  type: string;
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

const ResourcesInterface = () => {
  const [formations, setFormations] = useState<FormationEntity[]>([]);
  const [modules, setModules] = useState<ModuleEntity[]>([]);
  const [resources, setResources] = useState<ResourceEntity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [expandedFormations, setExpandedFormations] = useState(new Set());
  const [selectedResource, setSelectedResource] =
    useState<ResourceEntity | null>(null);
  const [editData, setEditData] = useState<EditResourceData>({
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchFormations();
    fetchModules();
    fetchResources();
  }, []);

  const fetchFormations = async () => {
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
      }
    } catch (error) {
      console.error("Error fetching formations:", error);
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
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/resources", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  // Helper function to get module by ID
  const getModuleById = (moduleId: string) => {
    return modules.find((module) => module.id === moduleId);
  };

  const getFormationByModuleId = (moduleId: string) => {
    const modulee = getModuleById(moduleId);
    if (!modulee) return null;
    return formations.find((formation) => formation.id === modulee.formationId);
  };

  const handleEdit = (resource: ResourceEntity) => {
    setSelectedResource(resource);
    setEditData({
      title: resource.title,
      type: resource.type,
      videoLink: resource.videoLink || "",
      pdfLink: resource.pdfLink || "",
      textLink: resource.textLink || "",
      content: resource.content || "",
      duration: resource.duration || 0,
      isCompleted: resource.isCompleted,
      thumbnail: resource.thumbnail || "",
      description: resource.description || "",
      moduleId: resource.moduleId,
    });
    setIsEditMenuOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedResource) return;
    setIsUpdating(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/resources/${selectedResource.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to update resource";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      const updatedResource = await response.json();
      setResources((prev) =>
        prev.map((r) => (r.id === selectedResource.id ? updatedResource : r))
      );
      setIsEditMenuOpen(false);
      setSelectedResource(null);
    } catch (error) {
      console.error("Error updating resource:", error);
      alert(`Erreur lors de la mise à jour de la ressource: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`http://127.0.0.1:3001/resources/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete resource";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      setResources((prev) => prev.filter((r) => r.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert(`Erreur lors de la suppression de la ressource: ${error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <VideoIcon size={16} />;
      case "pdf":
        return <FileTextIcon size={16} />;
      case "text":
        return <BookOpenIcon size={16} />;
      case "link":
        return <LinkIcon size={16} />;
      default:
        return <FileTextIcon size={16} />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      video: "bg-red-100 text-red-800",
      pdf: "bg-blue-100 text-blue-800",
      text: "bg-green-100 text-green-800",
      link: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          colors[type] || colors.text
        }`}
      >
        {type.toUpperCase()}
      </span>
    );
  };

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return "0 min";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const toggleFormation = (formationId: unknown) => {
    const newExpanded = new Set(expandedFormations);
    if (newExpanded.has(formationId)) {
      newExpanded.delete(formationId);
    } else {
      newExpanded.add(formationId);
    }
    setExpandedFormations(newExpanded);
  };

  const getFormationModules = (formationId: string) => {
    return modules
      .filter((module) => module.formationId === formationId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getModuleResources = (moduleId: string) => {
    return resources.filter((resource) => resource.moduleId === moduleId);
  };

  const getFormationResources = (formationId: string) => {
    const formationModules = getFormationModules(formationId);
    const allResources: ResourceEntity[] = [];

    formationModules.forEach((module) => {
      const moduleResources = getModuleResources(module.id);
      allResources.push(...moduleResources);
    });

    return allResources;
  };

  const getFormationStats = (formationId: string) => {
    const formationResources = getFormationResources(formationId);
    const totalResources = formationResources.length;
    const completedResources = formationResources.filter(
      (r) => r.isCompleted
    ).length;
    const totalDuration = formationResources.reduce(
      (sum, r) => sum + (r.duration || 0),
      0
    );

    return { totalResources, completedResources, totalDuration };
  };

  const filteredData = useMemo(() => {
    const formationsWithResources = formations.filter((formation) => {
      const stats = getFormationStats(formation.id);
      return stats.totalResources > 0;
    });

    if (!searchTerm) {
      return formationsWithResources;
    }

    return formationsWithResources.filter((formation) => {
      const formationMatch = formation.titre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const resourceMatch = getFormationResources(formation.id).some(
        (resource) =>
          resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return formationMatch || resourceMatch;
    });
  }, [searchTerm, formations, resources, modules]);

  const currentModule = getModuleById(editData.moduleId);
  const currentFormation = currentModule
    ? getFormationByModuleId(editData.moduleId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Gestion des Ressources
              </h1>
              <p className="text-gray-600 text-lg">
                Gérez les ressources pédagogiques par formation et module
              </p>
            </div>
            <Link href={"/dashboard/formateur/ressources/ajouter"}>
              <button className="flex flex-row bg-blue-600 text-white px-6 py-2 rounded-md space-x-2">
                <PlusIcon />
                <span className="text-l font-bold">Ajouter</span>
              </button>
            </Link>
          </div>

          <div className="relative mb-6">
            <SearchIcon
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher une ressource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm"
            />
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 w-12"></th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Formation / Ressource
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Module
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Durée
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Progression
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((formation) => {
                  const isExpanded = expandedFormations.has(formation.id);
                  const formationModules = getFormationModules(formation.id);
                  const stats = getFormationStats(formation.id);
                  const progressPercentage =
                    stats.totalResources > 0
                      ? Math.round(
                          (stats.completedResources / stats.totalResources) *
                            100
                        )
                      : 0;

                  return (
                    <React.Fragment key={formation.id}>
                      {/* Formation Row */}
                      <tr className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 hover:from-blue-100/50 hover:to-purple-100/50 transition-all duration-300">
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleFormation(formation.id)}
                            className="p-1 hover:bg-white/50 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon
                                size={20}
                                className="text-gray-600"
                              />
                            ) : (
                              <ChevronRightIcon
                                size={20}
                                className="text-gray-600"
                              />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                              <GraduationCapIcon size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-lg">
                                {formation.titre}
                              </div>

                              <div className="text-xs text-blue-600 mt-1">
                                {stats.totalResources} ressource
                                {stats.totalResources > 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                            FORMATION
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            {formationModules.length} module
                            {formationModules.length > 1 ? "s" : ""}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <ClockIcon size={16} />
                            {formatDuration(stats.totalDuration)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                              {progressPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            <FolderIcon className="text-gray-400" size={18} />
                          </div>
                        </td>
                      </tr>

                      {/* Module and Resource Rows */}
                      {isExpanded &&
                        formationModules.map((module) => {
                          const moduleResources = getModuleResources(
                            module.id
                          ).filter((resource) => {
                            if (!searchTerm) return true;
                            return (
                              resource.title
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              resource.description
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            );
                          });

                          return (
                            <React.Fragment key={module.id}>
                              {/* Module Row */}
                              <tr className="bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-300">
                                <td className="py-3 px-6 pl-12">
                                  <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300"></div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center text-white">
                                      <LayersIcon size={16} />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-800">
                                        {module.titre}
                                      </div>
                                      {module.description && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          {module.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <span className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                    MODULE
                                  </span>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="text-sm text-gray-600">
                                    {moduleResources.length} ressource
                                    {moduleResources.length > 1 ? "s" : ""}
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <ClockIcon size={14} />
                                    <span className="text-sm">
                                      {formatDuration(
                                        moduleResources.reduce(
                                          (sum, r) => sum + (r.duration || 0),
                                          0
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="text-sm text-gray-600">
                                    {
                                      moduleResources.filter(
                                        (r) => r.isCompleted
                                      ).length
                                    }
                                    /{moduleResources.length}
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex items-center justify-center">
                                    <LayersIcon
                                      className="text-gray-400"
                                      size={16}
                                    />
                                  </div>
                                </td>
                              </tr>

                              {/* Resource Rows */}
                              {moduleResources.map((resource) => (
                                <tr
                                  key={resource.id}
                                  className="hover:bg-blue-50/30 transition-all duration-300 group bg-gray-50/30"
                                >
                                  <td className="py-3 px-6 pl-16">
                                    <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300"></div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white">
                                        {getTypeIcon(resource.type)}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-800">
                                          {resource.title}
                                        </div>
                                        {resource.description && (
                                          <div className="text-sm text-gray-500 mt-1">
                                            {resource.description.length > 40
                                              ? `${resource.description.substring(
                                                  0,
                                                  40
                                                )}...`
                                              : resource.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    {getTypeBadge(resource.type)}
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <LayersIcon size={14} />
                                      <div className="text-sm">
                                        {module.titre}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <ClockIcon size={14} />
                                      <span className="text-sm">
                                        {formatDuration(resource.duration)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2">
                                      {resource.isCompleted ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-sm font-medium">
                                            Terminé
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-orange-600">
                                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                          <span className="text-sm">
                                            En cours
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center justify-center space-x-2">
                                      <button
                                        onClick={() => handleEdit(resource)}
                                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                                        title="Modifier"
                                      >
                                        <Edit3Icon size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setShowDeleteConfirm(resource.id)
                                        }
                                        disabled={isDeleting === resource.id}
                                        className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                                        title="Supprimer"
                                      >
                                        {isDeleting === resource.id ? (
                                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                        ) : (
                                          <Trash2Icon size={16} />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCapIcon className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucune formation trouvée
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Aucun résultat pour votre recherche"
                  : "Commencez par ajouter une nouvelle formation"}
              </p>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2Icon className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Confirmer la suppression
                </h3>
                <p className="text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer cette ressource ? Toutes ses
              données seront perdues définitivement.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting === showDeleteConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting === showDeleteConfirm
                  ? "Suppression..."
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isEditMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Modifier Ressource</h2>
                <p className="text-blue-100 mt-1">
                  Mettre à jour les informations
                </p>
              </div>
              <button
                onClick={() => setIsEditMenuOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XIcon size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {selectedResource && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {getTypeIcon(selectedResource.type)}
                  </div>
                  <p className="text-gray-500 text-sm">
                    ID: {selectedResource.id}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Titre de la ressource
                    </label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nom de la ressource"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type de ressource
                    </label>
                    <select
                      value={editData.type}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="video">Vidéo</option>
                      <option value="pdf">PDF</option>
                      <option value="text">Texte</option>
                      <option value="link">Lien</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Module
                    </label>
                    <select
                      value={editData.moduleId}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          moduleId: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un module</option>
                      {modules.map((module) => {
                        const formation = formations.find(
                          (f) => f.id === module.formationId
                        );
                        return (
                          <option key={module.id} value={module.id}>
                            {module.titre} -{" "}
                            {formation?.titre || "Formation inconnue"}
                          </option>
                        );
                      })}
                    </select>
                    {currentModule && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>Module actuel:</strong> {currentModule.titre}
                        </div>
                        {currentFormation && (
                          <div className="text-xs text-blue-600 mt-1">
                            Formation: {currentFormation.titre}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Description de la ressource"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Durée (minutes)
                      </label>
                      <input
                        type="number"
                        value={editData.duration}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            duration: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isCompleted"
                      checked={editData.isCompleted}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          isCompleted: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isCompleted"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ressource terminée
                    </label>
                  </div>

                  {editData.type === "video" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien vidéo
                      </label>
                      <input
                        type="url"
                        value={editData.videoLink}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            videoLink: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {editData.type === "pdf" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien PDF
                      </label>
                      <input
                        type="url"
                        value={editData.pdfLink}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            pdfLink: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {editData.type === "link" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien externe
                      </label>
                      <input
                        type="url"
                        value={editData.textLink}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            textLink: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {editData.type === "text" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contenu texte
                      </label>
                      <textarea
                        value={editData.content}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Contenu de la ressource..."
                        rows={5}
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <CheckIcon size={18} />
                          Mettre à jour
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMenuOpen(false);
                        setSelectedResource(null);
                      }}
                      disabled={isUpdating}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesInterface;

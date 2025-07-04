"use client";

import {
  CalendarIcon,
  Edit3Icon,
  MailIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export interface Formateur {
  id: string;
  nom: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  formations?: unknown[];
}

interface EditFormateurData {
  nom: string;
  email: string;
}

const FormateurInterface = () => {
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [selectedFormateur, setSelectedFormateur] = useState<Formateur | null>(
    null
  );
  const [editData, setEditData] = useState<EditFormateurData>({
    nom: "",
    email: "",
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchFormateurs();
  }, []);

  const fetchFormateurs = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/formateur", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch formateurs");
      }

      const data = await response.json();
      setFormateurs(data);
    } catch (error) {
      console.error("Error fetching formateurs:", error);
    }
  };

  const handleEdit = (formateur: Formateur) => {
    setSelectedFormateur(formateur);
    setEditData({ nom: formateur.nom, email: formateur.email });
    setIsEditMenuOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedFormateur) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/formateur/${selectedFormateur.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update formateur");
      }

      // Update the local state
      setFormateurs((prev) =>
        prev.map((f) =>
          f.id === selectedFormateur.id
            ? { ...f, ...editData, updatedAt: new Date().toISOString() }
            : f
        )
      );

      setIsEditMenuOpen(false);
      setSelectedFormateur(null);
    } catch (error) {
      console.error("Error updating formateur:", error);
      alert("Erreur lors de la mise à jour du formateur");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`http://127.0.0.1:3001/formateur/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete formateur");
      }

      // Remove from local state
      setFormateurs((prev) => prev.filter((f) => f.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting formateur:", error);
      alert("Erreur lors de la suppression du formateur");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredFormateurs = formateurs.filter(
    (formateur) =>
      formateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formateur.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Gestion des Formateurs
              </h1>
              <p className="text-gray-600 text-lg">
                Gérez vos formateurs et leurs informations
              </p>
            </div>
            <Link href={"/dashboard/formateur/formateurs/ajouter"}>
              <button className="flex flex-row bg-blue-600 text-white  px-6 py-2 rounded-md space-x-2">
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
              placeholder="Rechercher un formateur..."
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
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Formateur
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Formations
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Date de création
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFormateurs.map((formateur) => (
                  <tr
                    key={formateur.id}
                    className="hover:bg-blue-50/50 transition-all duration-300 group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {formateur.nom
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {formateur.nom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MailIcon size={16} />
                        {formateur.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {formateur.formations?.length || 0} formation(s)
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon size={16} />
                        {formatDate(formateur.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(formateur)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all"
                          title="Modifier"
                        >
                          <Edit3Icon size={18} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(formateur.id)}
                          disabled={isDeleting === formateur.id}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                          title="Supprimer"
                        >
                          {isDeleting === formateur.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                          ) : (
                            <Trash2Icon size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFormateurs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun formateur trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Aucun résultat pour votre recherche"
                  : "Commencez par ajouter un nouveau formateur"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
              Êtes-vous sûr de vouloir supprimer ce formateur ? Toutes ses
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

      {/* Edit Slide-out Menu */}
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isEditMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Modifier Formateur</h2>
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

          {/* Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedFormateur && (
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {selectedFormateur.nom
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <p className="text-gray-500 text-sm">
                    ID: {selectedFormateur.id}
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={editData.nom}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          nom: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nom du formateur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Informations
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Formations:</span>
                      <span className="font-medium">
                        {selectedFormateur.formations?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créé le:</span>
                      <span className="font-medium">
                        {formatDate(selectedFormateur.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modifié le:</span>
                      <span className="font-medium">
                        {formatDate(selectedFormateur.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditMenuOpen(false)}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdate}
                disabled={
                  isUpdating || !editData.nom.trim() || !editData.email.trim()
                }
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <SaveIcon size={18} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsEditMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default FormateurInterface;

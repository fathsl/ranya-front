"use client";

import {
  CalendarIcon,
  Edit3Icon,
  MailIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  FileTextIcon,
  PhoneIcon,
  ExternalLinkIcon,
  DownloadIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";

export enum Role {
  Admin = "admin",
  Formateur = "formateur",
  Participant = "participant",
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
}

export interface User {
  id: string;
  email: string;
  name: string;
  telephone?: string;
  linkedInLink?: string;
  cv?: string;
  isAccepted?: boolean;
  role: Role;
  status: UserStatus;
  hasCertificate: boolean;
  createdAt: string;
  updatedAt: string;
  formations?: unknown[];
  createdFormations?: unknown[];
}

interface EditUserData {
  email: string;
  name: string;
  telephone?: string;
  linkedInLink?: string;
  role: Role;
  status: UserStatus;
  isAccepted?: boolean;
  hasCertificate: boolean;
}

const UserFormateurInterface = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<EditUserData>({
    email: "",
    name: "",
    telephone: "",
    linkedInLink: "",
    role: Role.Formateur,
    status: UserStatus.Active,
    isAccepted: false,
    hasCertificate: false,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchFormateurUsers();
  }, []);

  const fetchFormateurUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      // Filter users with formateur role
      const formateurUsers = data.filter(
        (user: User) => user.role === Role.Formateur
      );
      setUsers(formateurUsers);
    } catch (error) {
      console.error("Error fetching formateur users:", error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditData({
      email: user.email,
      name: user.name,
      telephone: user.telephone || "",
      linkedInLink: user.linkedInLink || "",
      role: user.role,
      status: user.status,
      isAccepted: user.isAccepted || false,
      hasCertificate: user.hasCertificate,
    });
    setIsEditMenuOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/users/${selectedUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedUser = await response.json();

      // Update the local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, ...updatedUser, updatedAt: new Date().toISOString() }
            : u
        )
      );

      setIsEditMenuOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`http://127.0.0.1:3001/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleAcceptance = async (
    userId: string,
    currentStatus: boolean
  ) => {
    setIsTogglingStatus(userId);
    try {
      const response = await fetch(`http://127.0.0.1:3001/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAccepted: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const updatedUser = await response.json();

      // Update the local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isAccepted: updatedUser.isAccepted } : u
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setIsTogglingStatus(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.Active:
        return "bg-green-100 text-green-800";
      case UserStatus.Inactive:
        return "bg-gray-100 text-gray-800";
      case UserStatus.Suspended:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
                Gérez les utilisateurs avec le rôle formateur
              </p>
            </div>
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
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Accepté
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
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-50/50 transition-all duration-300 group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.hasCertificate ? "Certifié" : "Non certifié"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MailIcon size={16} />
                          {user.email}
                        </div>
                        {user.telephone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <PhoneIcon size={16} />
                            {user.telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() =>
                          handleToggleAcceptance(
                            user.id,
                            user.isAccepted || false
                          )
                        }
                        disabled={isTogglingStatus === user.id}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          user.isAccepted
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } ${
                          isTogglingStatus === user.id
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {isTogglingStatus === user.id ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        ) : user.isAccepted ? (
                          <CheckCircleIcon size={16} />
                        ) : (
                          <XCircleIcon size={16} />
                        )}
                        {user.isAccepted ? "Accepté" : "En attente"}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon size={16} />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all"
                          title="Modifier"
                        >
                          <Edit3Icon size={18} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          disabled={isDeleting === user.id}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                          title="Supprimer"
                        >
                          {isDeleting === user.id ? (
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

          {filteredUsers.length === 0 && (
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
                  : "Aucun utilisateur avec le rôle formateur"}
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
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses
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
            {selectedUser && (
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <p className="text-gray-500 text-sm">ID: {selectedUser.id}</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={editData.telephone || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          telephone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div>
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien LinkedIn
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={editData.linkedInLink || ""}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              linkedInLink: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="https://linkedin.com/in/..."
                        />
                        {editData.linkedInLink && (
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                editData.linkedInLink,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ouvrir le lien LinkedIn"
                          >
                            <ExternalLinkIcon size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={editData.status}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          status: e.target.value as UserStatus,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value={UserStatus.Active}>Actif</option>
                      <option value={UserStatus.Inactive}>Inactif</option>
                      <option value={UserStatus.Suspended}>Suspendu</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.isAccepted || false}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            isAccepted: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Accepté
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.hasCertificate}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            hasCertificate: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Certifié
                      </span>
                    </label>
                  </div>
                </div>

                {/* CV Section */}
                {selectedUser.cv && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FileTextIcon size={18} />
                      CV
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        CV disponible
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/CVs/${selectedUser.cv}`}
                          download
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                          title="Télécharger le CV"
                        >
                          <DownloadIcon size={16} />
                          Télécharger
                        </a>
                        <a
                          href={`/CVs/${selectedUser.cv}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          title="Ouvrir le CV dans un nouvel onglet"
                        >
                          <ExternalLinkIcon size={16} />
                          Voir le CV
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Informations
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Formations créées:</span>
                      <span className="font-medium">
                        {selectedUser.createdFormations?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formations participées:</span>
                      <span className="font-medium">
                        {selectedUser.formations?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créé le:</span>
                      <span className="font-medium">
                        {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modifié le:</span>
                      <span className="font-medium">
                        {formatDate(selectedUser.updatedAt)}
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
                  isUpdating || !editData.name.trim() || !editData.email.trim()
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

export default UserFormateurInterface;

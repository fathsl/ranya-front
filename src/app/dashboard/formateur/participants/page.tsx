"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AwardIcon,
  Edit3Icon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  SquareArrowOutUpRight,
  Trash2Icon,
  UserIcon,
  XIcon,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  telephone?: string;
  role: "participant" | "formateur" | "admin";
  status: "active" | "inactive" | "suspended";
  hasCertificate: boolean;
  formations?: Formation[];
  createdAt: string;
  updatedAt: string;
}

interface Formation {
  id: string;
  titre: string;
  completed: boolean;
}

interface EditUserData {
  name: string;
  email: string;
  telephone: string;
  status: "active" | "inactive" | "suspended";
  hasCertificate: boolean;
}

const ParticipantInterface = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<EditUserData>({
    name: "",
    email: "",
    telephone: "",
    status: "active",
    hasCertificate: false,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:3001/users?role=participant",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      telephone: user.telephone || "",
      status: user.status,
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
        let errorMessage = "Failed to update user";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
      );
      setIsEditMenuOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
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
        let errorMessage = "Failed to delete user";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      // Backend returns the deleted user object, but we just need to remove from state
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telephone &&
        user.telephone.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const getStatusBadge = (status: User["status"]) => {
    const statusConfig = {
      active: { bg: "bg-green-100", text: "text-green-800", label: "Actif" },
      inactive: { bg: "bg-gray-100", text: "text-gray-800", label: "Inactif" },
      suspended: { bg: "bg-red-100", text: "text-red-800", label: "Suspendu" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium`}
      >
        {config.label}
      </span>
    );
  };

  const handleGenerateCertificate = async (user: User) => {
    console.log("User object:", user); // Debug log
    console.log("User formations:", user.formations); // Debug log

    // Validate user has formations
    if (!user.formations || user.formations.length === 0) {
      alert("L'utilisateur n'a pas de formations associées");
      return;
    }

    // Get the first formation (you might want to let user choose)
    const formation = user.formations[0];

    console.log("Selected formation:", formation); // Debug log

    // More detailed validation
    if (!formation) {
      alert("Aucune formation trouvée pour cet utilisateur");
      return;
    }

    if (!formation.id) {
      alert("ID de formation manquant");
      console.error("Formation object:", formation);
      return;
    }

    if (!formation.titre) {
      alert("Titre de formation manquant");
      console.error("Formation object:", formation);
      return;
    }

    if (!user.id) {
      alert("ID utilisateur manquant");
      return;
    }

    if (!user.name) {
      alert("Nom utilisateur manquant");
      return;
    }

    setIsGeneratingCertificate(user.id);

    const requestBody = {
      participantId: user.id,
      formationId: formation.id,
      nomParticipant: user.name,
      formation: formation.titre,
    };

    console.log("Request body:", requestBody); // Debug log

    try {
      const response = await fetch("http://127.0.0.1:3001/certificats/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData); // Debug log
        throw new Error(errorData.message || "Failed to generate certificate");
      }

      const certificate = await response.json();

      // Refresh users list to update hasCertificate status
      await fetchUsers();

      console.log("Certificate generated:", certificate);
      alert("Certificat généré avec succès!");
    } catch (error) {
      console.error("Error generating certificate:", error);

      // Handle specific error messages
      if (
        error.message.includes("already exists") ||
        error.message.includes("existe déjà")
      ) {
        alert(
          "Un certificat existe déjà pour ce participant et cette formation"
        );
      } else if (error.message.includes("not found")) {
        alert("Participant ou formation introuvable");
      } else if (error.message.includes("not enrolled")) {
        alert("L'utilisateur n'est pas inscrit à cette formation");
      } else {
        alert("Erreur lors de la génération du certificat: " + error.message);
      }
    } finally {
      setIsGeneratingCertificate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Gestion des Participants
              </h1>
              <p className="text-gray-600 text-lg">
                Gérez les utilisateurs participants et leurs informations
              </p>
            </div>
            <Link href={"/dashboard/formateur/participants/ajouter"}>
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
              placeholder="Rechercher un participant..."
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
                    Participant
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Téléphone
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Certificat
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Formations
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
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MailIcon size={16} />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <PhoneIcon size={16} />
                        {user.telephone || "Non renseigné"}
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {user.hasCertificate ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <AwardIcon size={16} />
                            <span className="text-sm font-medium">Obtenu</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <AwardIcon size={16} />
                            <span className="text-sm">Non obtenu</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {user.formations?.length || 0} formation(s)
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-3">
                        <Link
                          href={`/dashboard/formateur/participants/${user.id}`}
                        >
                          <button>
                            <SquareArrowOutUpRight className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all"
                          title="Modifier"
                        >
                          <Edit3Icon size={18} />
                        </button>

                        <button
                          onClick={() => handleGenerateCertificate(user)}
                          disabled={
                            isGeneratingCertificate === user.id ||
                            user.hasCertificate ||
                            !user.formations?.length
                          }
                          className={`p-2 rounded-lg transition-all ${
                            user.hasCertificate || !user.formations?.length
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-green-600 hover:text-green-900 hover:bg-green-50"
                          } disabled:opacity-50`}
                          title={
                            user.hasCertificate
                              ? "Certificat déjà généré"
                              : !user.formations?.length
                              ? "Aucune formation associée"
                              : "Générer certificat"
                          }
                        >
                          {isGeneratingCertificate === user.id ? (
                            <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                          ) : (
                            <AwardIcon size={18} />
                          )}
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
                Aucun participant trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Aucun résultat pour votre recherche"
                  : "Commencez par ajouter un nouveau participant"}
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
                <h2 className="text-2xl font-bold">Modifier Participant</h2>
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
                      placeholder="Nom du participant"
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
                      Numéro de téléphone
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
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut du participant
                    </label>
                    <select
                      value={editData.status}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          status: e.target.value as
                            | "active"
                            | "inactive"
                            | "suspended",
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="suspended">Suspendu</option>
                    </select>
                  </div>

                  {/* Certificate Toggle */}
                  <div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">
                          Certificat obtenu
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Le participant a-t-il obtenu son certificat ?
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editData.hasCertificate}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              hasCertificate: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Informations
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Rôle:</span>
                      <span className="font-medium capitalize">
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formations:</span>
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

export default ParticipantInterface;

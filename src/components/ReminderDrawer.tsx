import {
  AlertCircleIcon,
  BellIcon,
  CheckIcon,
  LoaderIcon,
  SendIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

const ReminderDrawer = ({ isOpen, onClose, formation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

      if (formation?.participants && Array.isArray(formation.participants)) {
        const participantIds = formation.participants.map((p) =>
          typeof p === "object" ? p.id : p
        );
        const filteredUsers = data.filter((user) =>
          participantIds.includes(user.id)
        );
        setUsers(filteredUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Erreur lors du chargement des utilisateurs");
    }
  };

  useEffect(() => {
    if (formation?.participants) {
      fetchUsers();
    }
  }, [formation]);

  useEffect(() => {
    if (isOpen) {
      setUsers(users);
      setTitle(`Rappel: ${formation?.titre || "Formation"}`);
      setMessage(
        `N'oubliez pas votre formation "${
          formation?.titre || "Formation"
        }" qui approche. Assurez-vous d'être prêt(e) !`
      );
      setSelectedUserIds([]);
      setSuccess(false);
      setError("");
    }
  }, [isOpen, formation, users]);

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((user) => user.id));
    }
  };

  const handleSendReminder = async () => {
    if (selectedUserIds.length === 0) {
      setError("Veuillez sélectionner au moins un utilisateur");
      return;
    }

    if (!title.trim() || !message.trim()) {
      setError("Veuillez remplir le titre et le message");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:3001/notifications/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          body: message.trim(),
          type: "formation_reminder",
          metadata: {
            formationId: formation?.id,
            formationTitle: formation?.titre,
          },
          userIds: selectedUserIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de la notification");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 overflow-y-auto"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BellIcon size={24} />
              </div>
              <h2 className="text-xl font-bold">Envoyer un rappel</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XIcon size={24} />
            </button>
          </div>

          {formation && (
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm text-blue-100 mb-1">Formation</p>
              <p className="font-medium">{formation.titre}</p>
              <p className="text-sm text-blue-200">{formation.domaine}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rappel envoyé !
              </h3>
              <p className="text-gray-600">
                La notification a été envoyée à {selectedUserIds.length}{" "}
                utilisateur(s)
              </p>
            </div>
          ) : (
            <>
              {/* Message Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du rappel
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Titre de votre rappel..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Votre message de rappel..."
                  />
                </div>
              </div>

              {/* User Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UsersIcon size={20} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                      Destinataires ({selectedUserIds.length}/{users.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedUserIds.length === users.length
                      ? "Tout désélectionner"
                      : "Tout sélectionner"}
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all overflow-auto ${
                        selectedUserIds.includes(user.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedUserIds.includes(user.id)
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedUserIds.includes(user.id) && (
                          <CheckIcon size={12} className="text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <UserIcon size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "Formateur"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircleIcon size={20} className="text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {!success && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSendReminder}
                disabled={loading || selectedUserIds.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoaderIcon size={18} className="animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <SendIcon size={18} />
                    Envoyer le rappel
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReminderDrawer;

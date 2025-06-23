"use client";

import CertificateViewModal from "@/components/CertificateView";
import {
  ActivityIcon,
  AlertCircleIcon,
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  MailIcon,
  PhoneIcon,
  TrendingUpIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

interface ModuleEntity {
  id: string;
  titre: string;
  description?: string;
  duration?: number;
  order?: number;
  completed?: boolean;
  progress?: number;
}

interface Participant {
  id: string;
  user: User;
  formation: Formation;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  status: "enrolled" | "in-progress" | "completed" | "dropped";
}

interface Certificate {
  id: string;
  nomParticipant: string;
  formation: string;
  formationEntity?: Formation;
  dateObtention: string;
  urlPdf: string;
  participants: Participant[];
}

const ParticipantDashboard = () => {
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUser = async (userId: string): Promise<User> => {
    const response = await fetch(`http://127.0.0.1:3001/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch user: ${response.status} ${response.statusText}`
      );
    }

    const userData = await response.json();
    return userData;
  };

  const fetchFormations = async (userId: string): Promise<Formation[]> => {
    const response = await fetch("http://127.0.0.1:3001/formations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch formations: ${response.status} ${response.statusText}`
      );
    }

    const formationsData = await response.json();

    const userFormations = formationsData.filter((formation: Formation) =>
      formation.participants.some((user: Participant) => user.id === userId)
    );

    return userFormations;
  };

  const fetchCertificates = async (userId: string): Promise<Certificate[]> => {
    const response = await fetch(
      `http://127.0.0.1:3001/certificats/user/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch certificates: ${response.status} ${response.statusText}`
      );
    }

    const certificatesData = await response.json();
    return certificatesData;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userData = await fetchUser(userId);
        setUser(userData);

        const formationsData = await fetchFormations(userId);
        setFormations(formationsData);

        const certificatesData = await fetchCertificates(userId);
        setCertificates(certificatesData);
      } catch (err) {
        const errorMessage = `Failed to load participant data: ${
          err instanceof Error ? err.message : "Unknown error"
        }`;
        setError(errorMessage);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  const handleViewCertificate = (certificateId: string) => {
    setSelectedCertificateId(certificateId);
    setIsModalOpen(true);
  };

  const handleDownloadCertificate = (
    certificateId: string,
    fileName: string
  ) => {
    console.log("Télécharger certificat:", certificateId, fileName);

    const certificate = certificates.find((cert) => cert.id === certificateId);
    if (!certificate) {
      console.error("Certificate not found");
      return;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCertificateId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      case "suspended":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "inactive":
        return <AlertCircleIcon className="w-4 h-4" />;
      case "suspended":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <AlertCircleIcon className="w-4 h-4" />;
    }
  };

  const calculateOverallProgress = () => {
    if (formations.length === 0) return 0;
    const totalProgress = formations.reduce((sum, formation) => {
      const moduleProgress = formation.modules.reduce(
        (moduleSum, module) => moduleSum + (module.progress || 0),
        0
      );
      return sum + moduleProgress / formation.modules.length;
    }, 0);
    return Math.round(totalProgress / formations.length);
  };

  const getTotalCompletedModules = () => {
    return formations.reduce(
      (total, formation) =>
        total + formation.modules.filter((module) => module.completed).length,
      0
    );
  };

  const getTotalModules = () => {
    return formations.reduce(
      (total, formation) => total + formation.modules.length,
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading participant data...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error || "User not found"}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-gray-600 mt-1">Participant Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  user.status
                )}`}
              >
                {getStatusIcon(user.status)}
                <span className="ml-1 capitalize">{user.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Formations
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formations.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Modules Completed
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {getTotalCompletedModules()}/{getTotalModules()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Overall Progress
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {calculateOverallProgress()}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUpIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Certificates
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {certificates.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AwardIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Participant Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MailIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              {user.telephone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">
                      {user.telephone}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ActivityIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last Activity</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpenIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Formations Progress
            </h2>
            <div className="space-y-6">
              {formations.map((formation) => {
                const completedModules = formation.modules.filter(
                  (module) => module.completed
                ).length;
                const totalModules = formation.modules.length;
                const progress =
                  totalModules > 0
                    ? Math.round((completedModules / totalModules) * 100)
                    : 0;

                return (
                  <div
                    key={formation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {formation.titre}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {formation.domaine}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formation.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          formation.accessType === "public"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {formation.accessType}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Progress: {completedModules}/{totalModules} modules
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {formation.modules.map((module) => (
                        <div
                          key={module.id}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              module.completed ? "bg-green-500" : "bg-gray-300"
                            }`}
                          ></div>
                          <span
                            className={`text-xs ${
                              module.completed
                                ? "text-green-700"
                                : "text-gray-600"
                            }`}
                          >
                            {module.titre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {certificates.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <AwardIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Certificates Earned
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <AwardIcon className="w-8 h-8 text-yellow-500" />
                    <span className="text-xs text-gray-500">
                      {new Date(certificate.dateObtention).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {certificate.formation}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Awarded to {certificate.nomParticipant}
                  </p>
                  <button
                    onClick={() => handleViewCertificate(certificate.id)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                  >
                    View Certificate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <CertificateViewModal
        certificateId={selectedCertificateId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        certificates={certificates}
        handleDownload={handleDownloadCertificate}
      />
    </div>
  );
};

export default ParticipantDashboard;

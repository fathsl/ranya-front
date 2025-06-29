"use client";

import {
  AlertCircleIcon,
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  DownloadIcon,
  LoaderIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Resource {
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
  module: Module;
  createdAt: string;
  updatedAt: string;
}

interface Module {
  id: string;
  titre?: string;
  name?: string;
  resources: Resource[];
}

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface Participant {
  id: string;
  nom?: string;
  email?: string;
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
  modules: Module[];
  participants: User[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface EvaluationTest {
  id?: string;
  isEnabled: boolean;
  title: string;
  timeLimit: number;
  passingScore: number;
  description: string;
  questions: any[];
}

const ParticipantDashboard = () => {
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setUser(userData);
    return userData;
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUser(userId);
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAllData = async () => {
      setLoading(true);

      try {
        // 1. Formations
        const formationsRes = await fetch("http://127.0.0.1:3001/formations");
        const formationsData = await formationsRes.json();
        const activeFormations = formationsData.filter(
          (formation: Formation) =>
            !formation.archived &&
            formation.participants?.some(
              (participant: any) => participant.id === user.id
            )
        );
        setFormations(activeFormations);

        // 2. Certificates
        const certRes = await fetch("http://127.0.0.1:3001/certificats");
        const certData: Certificate[] = await certRes.json();
        const userCertificates = certData.filter((certificate) =>
          certificate.participants?.some((p) => p.id === user.id)
        );
        setCertificates(userCertificates);

        // 3. Questions
        const questionsRes = await fetch("http://127.0.0.1:3001/questions");
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);

        // 4. Resources
        const resourcesRes = await fetch("http://127.0.0.1:3001/resources");
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData);

        // 5. Evaluations
        const evaluationsRes = await fetch(
          "http://127.0.0.1:3001/evaluation-tests"
        );
        const evaluationsData = await evaluationsRes.json();
        setEvaluations(evaluationsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Erreur de chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id]);

  const calculateProgress = (formation: Formation) => {
    if (!formation.modules || formation.modules.length === 0) {
      return 0;
    }

    const completedModules = formation.modules.filter((module) => {
      if (!module.resources || module.resources.length === 0) {
        return true;
      }

      return module.resources.every((resource) => resource.isCompleted);
    }).length;

    return (completedModules / formation.modules.length) * 100;
  };

  const getOverallStats = () => {
    const totalFormations = formations.length;
    const completedFormations = formations.filter(
      (f) => calculateProgress(f) === 100
    ).length;
    const totalCertificates = certificates.length;
    const averageProgress =
      formations.length > 0
        ? formations.reduce((acc, f) => acc + calculateProgress(f), 0) /
          formations.length
        : 0;

    return {
      totalFormations,
      completedFormations,
      totalCertificates,
      averageProgress: Math.round(averageProgress),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">
            Chargement de votre tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erreur de connexion
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de Bord
              </h1>
              <p className="text-gray-600 mt-1">Bienvenue, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <BookOpenIcon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Formations Actives
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalFormations}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Formations Terminées
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.completedFormations}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificats</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalCertificates}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <AwardIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Progrès Moyen
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.averageProgress}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUpIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Formations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Mes Formations
                </h2>
              </div>
              <div className="p-6">
                {formations.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune formation active</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formations.map((formation) => {
                      const progress = calculateProgress(formation);
                      return (
                        <div
                          key={formation.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {formation.titre}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {formation.domaine}
                              </p>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {formation.description}
                              </p>
                            </div>
                            <div className="ml-4 text-right">
                              <span className="text-sm font-medium text-gray-900">
                                {Math.round(progress)}%
                              </span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center">
                              <UsersIcon className="w-4 h-4 mr-1" />
                              {formation.modules.length} modules
                            </span>
                            <span className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {new Date(formation.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificates & Resources */}
          <div className="space-y-6">
            {/* Certificates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <AwardIcon className="w-5 h-5 mr-2 text-yellow-600" />
                  Mes Certificats
                </h2>
              </div>
              <div className="p-6">
                {certificates.length === 0 ? (
                  <div className="text-center py-4">
                    <AwardIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Aucun certificat obtenu
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {certificate.formation}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(
                                certificate.dateObtention
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <button
                            // onClick={() =>
                            //   window.open(certificate.urlPdf, "_blank")
                            // }
                            className="ml-2 p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TargetIcon className="w-5 h-5 mr-2 text-green-600" />
                  Ressources
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium text-blue-900">
                        {questions.length}
                      </p>
                      <p className="text-blue-700">Questions</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium text-green-900">
                        {resources.length}
                      </p>
                      <p className="text-green-700">Ressources</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;

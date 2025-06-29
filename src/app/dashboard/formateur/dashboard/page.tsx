"use client";

import { useAuth } from "@/contexts/authContext";
import {
  calculateDashboardData,
  calculateMonthlyFormationsData,
  calculateUserFormationStats,
  DashboardData,
  DOMAIN_COLORS,
  Formation,
  MonthlyData,
  TopUser,
  UserStats,
} from "@/help/help";
import {
  AwardIcon,
  BookOpenIcon,
  GraduationCapIcon,
  TargetIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaIcons } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";

const Dashboard = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [certificates, setCertificates] = useState(0);
  const [invitations, setInvitations] = useState(0);
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    uniqueUsers: 0,
    totalFormations: 0,
    averageFormationsPerUser: 0,
    topUsers: [],
    userFormationCounts: {},
  });

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserFormations = async (): Promise<Formation[]> => {
      if (!user?.id) {
        throw new Error("User ID not available");
      }

      try {
        const response = await fetch("http://127.0.0.1:3001/formations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allFormations = await response.json();

        const userFormations = allFormations.filter(
          (formation: Formation) => formation.userId === user.id
        );

        const certificatesResponse = await fetch(
          "http://127.0.0.1:3001/certificats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!certificatesResponse.ok) {
          throw new Error(`HTTP error! status: ${certificatesResponse.status}`);
        }

        const certificatesData = await certificatesResponse.json();

        const formationIds = userFormations.map(
          (formation: Formation) => formation.id
        );

        const matchingCertificates = certificatesData.filter(
          (certificate: any) => formationIds.includes(certificate.formationId)
        );

        const certificatesCount = Array.isArray(matchingCertificates)
          ? matchingCertificates.length
          : matchingCertificates.certificates?.length ||
            matchingCertificates.certificats?.length ||
            0;

        setCertificates(certificatesCount);

        const invitationsResponse = await fetch(
          `http://127.0.0.1:3001/invitations`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!invitationsResponse.ok) {
          throw new Error(`HTTP error! status: ${invitationsResponse.status}`);
        }

        const invitationData = await invitationsResponse.json();

        const matchingInvitations = invitationData.filter((invitation: any) =>
          formationIds.includes(invitation.formationId)
        );

        const invitationsCount = Array.isArray(matchingInvitations)
          ? matchingInvitations.length
          : matchingInvitations.invitations?.length || 0;

        setInvitations(invitationsCount);

        return userFormations;
      } catch (error) {
        console.error("Error fetching user formations:", error);
        throw error;
      }
    };

    const loadFormations = async () => {
      try {
        setLoading(true);
        setError(null);

        const formationsData = await fetchUserFormations();
        setFormations(formationsData);

        const monthlyChartData = calculateMonthlyFormationsData(formationsData);
        setMonthlyData(monthlyChartData);

        const stats = calculateUserFormationStats(formationsData);
        setUserStats(stats);

        const calculatedDashboardData = calculateDashboardData(formationsData);
        setDashboardData(calculatedDashboardData);
      } catch (error: any) {
        setError(error.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadFormations();
    }
  }, [user?.id]);

  const preparePieChartData = () => {
    if (!dashboardData) return [];

    const domainData = dashboardData.domainData;
    const total = Object.values(domainData).reduce(
      (sum, count) => sum + count,
      0
    );

    return Object.entries(domainData).map(([domain, count], index) => ({
      name: domain,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      actualCount: count,
      color: DOMAIN_COLORS[index % DOMAIN_COLORS.length],
    }));
  };

  const pieChartData = preparePieChartData();
  const totalParticipants = formations.reduce((total, formation) => {
    return total + formation.participants.length;
  }, 0);

  const StatCard = ({ title = "", icon, value = 0, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <FaIcons className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de Bord
        </h1>
        <p className="text-gray-600">Aperçu de votre plateforme e-learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Total Formations"
          value={dashboardData.totalFormations}
          icon={BookOpenIcon}
          color="blue"
        />
        <StatCard
          title="Formations ce Mois"
          value={dashboardData.thisMonthFormations}
          icon={BookOpenIcon}
          color="green"
        />
        <StatCard
          title="Participants"
          value={totalParticipants}
          icon={GraduationCapIcon}
          color="green"
        />
        <StatCard
          title="Invitations"
          value={invitations}
          icon={TargetIcon}
          color="orange"
        />
        <StatCard
          title="Participants Uniques"
          value={userStats.uniqueUsers}
          icon={UsersIcon}
          color="green"
        />
        <StatCard
          title="Certifications"
          value={certificates}
          icon={AwardIcon}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Évolution Mensuelle
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Participants</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Formations</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="participants"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                name="Total Participants"
              />
              <Line
                type="monotone"
                dataKey="formations"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                name="Formations"
              />
              <Line
                type="monotone"
                dataKey="uniqueParticipants"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                name="Participants Uniques"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Catégories de Formations
          </h3>
          {pieChartData.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${props.payload.actualCount} formations (${value}%)`,
                        "Nombre",
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full lg:w-1/2 mt-4 lg:mt-0 lg:pl-6">
                <div className="space-y-3">
                  {pieChartData.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          {category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {category.actualCount}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({category.value}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée de domaine disponible
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Top Participants
          </h3>
          <div className="p-2 rounded-lg bg-orange-50">
            <TrophyIcon className="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <div className="space-y-3">
          {userStats.topUsers.map((user: TopUser, index: number) => (
            <div
              key={`top-user-${user.userId}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : index === 1
                      ? "bg-gray-100 text-gray-800"
                      : index === 2
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm text-gray-600">
                  User {user.userId}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {user.count} formations
              </span>
            </div>
          ))}
          {userStats.topUsers.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              Aucun participant trouvé
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Statistiques Mensuelles
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                  Mois
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                  Formations
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                  Total Participants
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                  Participants Uniques
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                  Moyenne par Formation
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr
                  key={`monthly-${index}`}
                  className="border-b border-gray-100"
                >
                  <td className="py-2 px-3 text-sm text-gray-900">
                    {data.month}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {data.formations}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {data.participants}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {data.uniqueParticipants}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {data.formations > 0
                      ? (data.participants / data.formations).toFixed(1)
                      : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {monthlyData.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">
              Aucune donnée mensuelle disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

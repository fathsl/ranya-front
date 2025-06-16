"use client";

import {
  ActivityIcon,
  AwardIcon,
  BookOpenIcon,
  CheckCircleIcon,
  GraduationCapIcon,
  PlayIcon,
  StarIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import React from "react";
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
  const stats = {
    totalFormations: 156,
    totalFormateurs: 24,
    totalParticipants: 1247,
    completionRate: 87,
    activeFormations: 45,
    monthlyGrowth: 12.5,
  };

  const monthlyData = [
    { month: "Jan", participants: 980, formations: 120, completions: 85 },
    { month: "Fév", participants: 1050, formations: 135, completions: 92 },
    { month: "Mar", participants: 1120, formations: 142, completions: 88 },
    { month: "Avr", participants: 1180, formations: 148, completions: 90 },
    { month: "Mai", participants: 1247, formations: 156, completions: 87 },
  ];

  const formationCategories = [
    { name: "Développement Web", value: 35, color: "#3B82F6" },
    { name: "Design UI/UX", value: 25, color: "#8B5CF6" },
    { name: "Marketing Digital", value: 20, color: "#10B981" },
    { name: "Gestion de Projet", value: 15, color: "#F59E0B" },
    { name: "Autres", value: 5, color: "#EF4444" },
  ];

  const topFormateurs = [
    { name: "Sarah Martin", formations: 12, rating: 4.9, participants: 245 },
    { name: "Ahmed Benali", formations: 8, rating: 4.8, participants: 189 },
    { name: "Marie Dubois", formations: 10, rating: 4.7, participants: 167 },
    { name: "Omar Tazi", formations: 6, rating: 4.9, participants: 134 },
  ];

  const recentActivities = [
    {
      type: "new_participant",
      message: "15 nouveaux participants cette semaine",
      time: "2h",
    },
    {
      type: "formation_completed",
      message: 'Formation "React Avancé" terminée par 23 participants',
      time: "4h",
    },
    {
      type: "new_formation",
      message: 'Nouvelle formation "Vue.js" ajoutée',
      time: "1j",
    },
    {
      type: "achievement",
      message: "1000+ participants ont terminé leurs formations ce mois",
      time: "2j",
    },
  ];

  const StatCard = ({
    title = "",
    icon,
    value = 0,
    change = 0,
    color = "blue",
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">ce mois</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <FaIcons className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

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
          value={stats.totalFormations}
          icon={BookOpenIcon}
          change={8.2}
          color="blue"
        />
        <StatCard
          title="Formateurs Actifs"
          value={stats.totalFormateurs}
          icon={UsersIcon}
          change={5.1}
          color="purple"
        />
        <StatCard
          title="Participants"
          value={stats.totalParticipants}
          icon={GraduationCapIcon}
          change={12.5}
          color="green"
        />
        <StatCard
          title="Taux de Réussite"
          value={stats.completionRate}
          icon={TargetIcon}
          change={3.2}
          color="orange"
        />
        <StatCard
          title="Formations Actives"
          value={stats.activeFormations}
          icon={PlayIcon}
          color="red"
        />
        <StatCard
          title="Certifications"
          value={892}
          icon={AwardIcon}
          change={15.3}
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
              />
              <Line
                type="monotone"
                dataKey="formations"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Catégories de Formations
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                dataKey="value"
                data={formationCategories}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {formationCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {formationCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {category.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Formateurs
            </h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tout
            </button>
          </div>
          <div className="space-y-4">
            {topFormateurs.map((formateur, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {formateur.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formateur.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formateur.formations} formations
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {formateur.rating}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formateur.participants} participants
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Activités Récentes
            </h3>
            <ActivityIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {activity.type === "new_participant" && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === "formation_completed" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  {activity.type === "new_formation" && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpenIcon className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  {activity.type === "achievement" && (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <AwardIcon className="w-4 h-4 text-orange-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Il y a {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

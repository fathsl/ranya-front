"use client";

import {
  ActivityIcon,
  AwardIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  MedalIcon,
  StarIcon,
  TargetIcon,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ParticipantDashboard = () => {
  const stats = {
    totalFormations: 12,
    formationsCompleted: 8,
    totalCertificats: 8,
    tauxReussite: "87%",
    heuresEtude: 145,
    niveauActuel: "Avancé",
  };

  const monthlyData = [
    { month: "Jan", heuresEtude: 12, formationsCompletes: 1 },
    { month: "Fév", heuresEtude: 18, formationsCompletes: 2 },
    { month: "Mar", heuresEtude: 25, formationsCompletes: 2 },
    { month: "Avr", heuresEtude: 30, formationsCompletes: 3 },
    { month: "Mai", heuresEtude: 35, formationsCompletes: 4 },
    { month: "Jun", heuresEtude: 42, formationsCompletes: 5 },
  ];

  const categoriesFormations = [
    { name: "Développement Web", value: 35, color: "#3B82F6" },
    { name: "Design UI/UX", value: 25, color: "#8B5CF6" },
    { name: "Data Science", value: 20, color: "#10B981" },
    { name: "Marketing Digital", value: 15, color: "#F59E0B" },
    { name: "Gestion de Projet", value: 5, color: "#EF4444" },
  ];

  const mesFormations = [
    {
      titre: "Développement React Avancé",
      formateur: "Jean Dupont",
      progres: 85,
      statut: "en_cours",
      rating: 4.8,
      heures: "8h 30m",
    },
    {
      titre: "Design System & Figma",
      formateur: "Marie Martin",
      progres: 100,
      statut: "complete",
      rating: 4.9,
      heures: "12h 15m",
    },
    {
      titre: "Python pour Data Science",
      formateur: "Ahmed Ben Ali",
      progres: 45,
      statut: "en_cours",
      rating: 4.7,
      heures: "15h 20m",
    },
    {
      titre: "Marketing Digital Complet",
      formateur: "Sophie Rousseau",
      progres: 100,
      statut: "complete",
      rating: 4.6,
      heures: "10h 45m",
    },
  ];

  const activitesRecentes = [
    {
      type: "formation_completed",
      message: "Formation 'Design System & Figma' terminée avec succès",
      time: "2 heures",
    },
    {
      type: "certificate_earned",
      message: "Certificat 'Marketing Digital Expert' obtenu",
      time: "1 jour",
    },
    {
      type: "level_up",
      message: "Niveau 'Avancé' atteint - Félicitations !",
      time: "3 jours",
    },
    {
      type: "new_formation",
      message: "Inscription à la formation 'Python pour Data Science'",
      time: "5 jours",
    },
    {
      type: "payment",
      message: "Paiement de 89.99€ effectué pour 'React Avancé'",
      time: "1 semaine",
    },
  ];

  const StatCard = ({ title, value, icon: Icon, change, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-green-600 text-sm font-medium mt-1">
              +{change}% ce mois
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mon Tableau de Bord
        </h1>
        <p className="text-gray-600">
          Suivez votre progression d&apos;apprentissage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Mes Formations"
          value={stats.totalFormations}
          icon={BookOpenIcon}
          change={8.2}
          color="blue"
        />
        <StatCard
          title="Formations Terminées"
          value={stats.formationsCompleted}
          icon={CheckCircleIcon}
          change={12.5}
          color="green"
        />
        <StatCard
          title="Certificats Obtenus"
          value={stats.totalCertificats}
          icon={AwardIcon}
          change={15.3}
          color="purple"
        />
        <StatCard
          title="Taux de Réussite"
          value={stats.tauxReussite}
          icon={TargetIcon}
          change={3.2}
          color="orange"
        />
        <StatCard
          title="Heures d'Étude"
          value={stats.heuresEtude}
          icon={ClockIcon}
          change={5.1}
          color="red"
        />
        <StatCard
          title="Niveau Actuel"
          value={stats.niveauActuel}
          icon={MedalIcon}
          change={5.1}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Progression Mensuelle
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">
                  Heures d&apos;étude
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">
                  Formations complétées
                </span>
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
                dataKey="heuresEtude"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="formationsCompletes"
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
            <PieChart>
              <Pie
                dataKey="value"
                data={categoriesFormations}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {categoriesFormations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoriesFormations.map((category, index) => (
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
              Mes Formations
            </h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tout
            </button>
          </div>
          <div className="space-y-4">
            {mesFormations.map((formation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold mr-4">
                    <BookOpenIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {formation.titre}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Par {formation.formateur} • {formation.heures}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${formation.progres}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formation.progres}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center mb-2">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {formation.rating}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      formation.statut === "complete"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {formation.statut === "complete" ? "Terminé" : "En cours"}
                  </span>
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
            {activitesRecentes.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {activity.type === "formation_completed" && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === "certificate_earned" && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <AwardIcon className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  {activity.type === "level_up" && (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <MedalIcon className="w-4 h-4 text-orange-600" />
                    </div>
                  )}
                  {activity.type === "new_formation" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpenIcon className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  {activity.type === "payment" && (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <CreditCardIcon className="w-4 h-4 text-red-600" />
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

export default ParticipantDashboard;

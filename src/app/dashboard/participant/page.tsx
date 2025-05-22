"use client";

import Link from "next/link";
import {
  FaPlus,
  FaUsers,
  FaChartLine,
  FaStar,
  FaEnvelopeOpenText,
  FaUserEdit,
  FaBook,
  FaCogs,
  FaBell,
  FaVideo,
} from "react-icons/fa";

export default function DashboardParticipant() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-600 mb-2 text-center">
          🎓 Tableau de bord Participant
        </h1>
        <p className="text-gray-500 text-center mb-12">
          Gérez vos formations, participants et suivez les progrès en un coup
          d&apos;œil.
        </p>

        {/* SECTION 1 */}
        <Section title="📚 Gestion des formations">
          <DashboardCard
            title="Mes Formations"
            icon={<FaChartLine className="text-orange-500" size={22} />}
            description="Consultez et gérez vos formations actuelles."
            href="/dashboard/formations"
          />
          <DashboardCard
            title="Ajouter une Formation"
            icon={<FaPlus className="text-green-500" size={22} />}
            description="Créez un nouveau parcours pédagogique."
            href="/dashboard/formations/ajouter"
          />
          <DashboardCard
            title="Bibliothèque de ressources"
            icon={<FaBook className="text-blue-600" size={22} />}
            description="Ajoutez et gérez vos supports de cours."
            href="/dashboard/ressources"
          />
        </Section>

        {/* SECTION 2 */}
        <Section title="👥 Gestion des participants">
          <DashboardCard
            title="Inviter des Participants"
            icon={<FaEnvelopeOpenText className="text-purple-600" size={22} />}
            description="Ajout manuel, CSV ou lien d’invitation."
            href="/dashboard/invitation"
          />
          <DashboardCard
            title="Mes Participants"
            icon={<FaUsers className="text-blue-600" size={22} />}
            description="Liste complète, gestion et affectations."
            href="/dashboard/participants"
          />
          <DashboardCard
            title="Classement & Récompenses"
            icon={<FaStar className="text-yellow-500" size={22} />}
            description="Top apprenants, badges et étoiles."
            href="/dashboard/classement"
          />
        </Section>

        {/* SECTION 3 */}
        <Section title="📈 Suivi & Analyse">
          <DashboardCard
            title="Progression & Engagement"
            icon={<FaChartLine className="text-emerald-600" size={22} />}
            description="Suivez l’avancement global des apprenants."
            href="/dashboard/progressions"
          />
          <DashboardCard
            title="Alertes & Rapports"
            icon={<FaBell className="text-red-500" size={22} />}
            description="Inactivité, seuils critiques, relances auto."
            href="/dashboard/alertes"
          />
          <DashboardCard
            title="Suivi des Profils"
            icon={<FaUserEdit className="text-indigo-600" size={22} />}
            description="Profil détaillé de chaque participant."
            href="/dashboard/profils"
          />
          <DashboardCard
            title="Notifications & Rappels"
            icon={<FaEnvelopeOpenText className="text-orange-600" size={22} />}
            description="Envoyez des relances automatiques ciblées."
            href="/dashboard/notifications"
          />
        </Section>

        {/* SECTION 4 */}
        <Section title="🎥 Vidéos & Interactions">
          <DashboardCard
            title="Vidéos & Quiz intégrés"
            icon={<FaVideo className="text-indigo-500" size={22} />}
            description="Lecteur intelligent, QCM en direct et suivi."
            href="/dashboard/videos"
          />
        </Section>

        {/* SECTION 5 */}
        <Section title="⚙️ Paramètres & Compte">
          <DashboardCard
            title="Paramètres du compte"
            icon={<FaCogs className="text-gray-600" size={22} />}
            description="Gérez votre profil, alertes et préférences."
            href="/dashboard/parametres"
          />
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.5 h-6 bg-orange-500 rounded"></div>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {children}
      </div>
    </section>
  );
}

function DashboardCard({
  title,
  icon,
  description,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="group bg-white border border-gray-100 hover:border-orange-400 hover:shadow-lg rounded-xl p-5 cursor-pointer transition-all duration-200 h-full flex flex-col justify-between">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-orange-50 p-3 rounded-full group-hover:scale-105 transition">
            {icon}
          </div>
          <h3 className="text-md font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}

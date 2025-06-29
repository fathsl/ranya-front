import { useAuth } from "@/contexts/authContext";
import {
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  FilesIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  UserCheckIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const Sidebar = () => {
  const [isCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const { user } = useAuth();
  const menuItemsFormateur = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboardIcon,
      href: "/dashboard/formateur/dashboard",
    },
    {
      id: "formations",
      label: "Formations",
      icon: BookOpenIcon,
      href: "/dashboard/formateur/formations",
    },
    {
      id: "calendrier",
      label: "Calendrier",
      icon: CalendarIcon,
      href: "/dashboard/participant/calendrier",
    },
    {
      id: "ressources",
      label: "Ressources",
      icon: FilesIcon,
      href: "/dashboard/formateur/ressources",
    },
    {
      id: "participants",
      label: "Participants",
      icon: GraduationCapIcon,
      href: "/dashboard/formateur/participants",
    },
  ];

  const menuItemsParticip = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboardIcon,
      href: "/dashboard/participant/dashboard",
    },
    {
      id: "formations",
      label: "Formations",
      icon: BookOpenIcon,
      href: "/dashboard/participant/formations",
    },
    {
      id: "mesFormations",
      label: "Mes Formations",
      icon: BookOpenIcon,
      href: "/dashboard/participant/mes-formations",
    },

    {
      id: "certificats",
      label: "Mes Certificats",
      icon: AwardIcon,
      href: "/dashboard/participant/certificates",
    },
  ];

  const menuItemsAdmin = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboardIcon,
      href: "/dashboard/admin/dashboard",
    },
    {
      id: "formations",
      label: "Formations",
      icon: BookOpenIcon,
      href: "/dashboard/formateur/formations",
    },
    {
      id: "formateurs",
      label: "Formateurs",
      icon: UserCheckIcon,
      href: "/dashboard/admin/formateurs",
    },
    {
      id: "participants",
      label: "Participants",
      icon: GraduationCapIcon,
      href: "/dashboard/formateur/participants",
    },
  ];

  const menuItems =
    user?.role === "formateur"
      ? menuItemsFormateur
      : user?.role === "participant"
      ? menuItemsParticip
      : menuItemsAdmin;

  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      } min-h-screen relative`}
    >
      <div className="p-6 border-b border-gray-200">
        {!isCollapsed ? (
          <h2 className="text-xl font-bold text-gray-800">Dashboard Panel</h2>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
        )}
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <Link href={item.href}>
                  <button
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isCollapsed ? "mx-auto" : "mr-3"} ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-blue-600"
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

"use client";

import {
  CalendarIcon,
  MailIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export interface Formateur {
  id: string;
  nom: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  formations?: unknown[];
}

const FormateurInterface = () => {
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await fetch("http://localhost:3001/formateur", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch formateurs");
        }

        const data = await response.json();
        setFormateurs(data);
      } catch (error) {
        console.error("Error fetching formateurs:", error);
      }
    };

    fetchFormateurs();
  }, []);

  const filteredFormateurs = formateurs.filter(
    (formateur) =>
      formateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formateur.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                Gérez vos formateurs et leurs informations
              </p>
            </div>
            <Link href={"/dashboard/formateur/formateurs/ajouter"}>
              <button className="flex flex-row bg-blue-600 text-white  px-6 py-2 rounded-md space-x-2">
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
                    Email
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Formations
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
                {filteredFormateurs.map((formateur) => (
                  <tr
                    key={formateur.id}
                    className="hover:bg-blue-50/50 transition-all duration-300 group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {formateur.nom
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {formateur.nom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MailIcon size={16} />
                        {formateur.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {formateur.formations?.length || 0} formation(s)
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon size={16} />
                        {formatDate(formateur.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-3">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFormateurs.length === 0 && (
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
                  : "Commencez par ajouter un nouveau formateur"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormateurInterface;

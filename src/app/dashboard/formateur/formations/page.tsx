"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Formateur } from "../formateurs/page";

export interface Participant {
  id: string;
  name: string;
}

export interface ModuleEntity {
  id: string;
}

export interface Formation {
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
  formateur: Formateur;
  formateurId: string;
  modules: ModuleEntity[];
  participants: Participant[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

const Formations = () => {
  const [formations, setFormations] = useState<Formation[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:3001/formations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFormations(data);
      } catch (error: unknown) {
        setError(error.message);
        console.error("Error fetching formations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  if (loading) {
    return <div>Loading formations...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Gestion des Formations
        </h1>
        <p className="text-gray-600 text-lg">
          Gérez vos formations et leurs informations
        </p>
      </div>

      <div className="flex justify-end items-end my-4">
        <Link href={"/dashboard/formateur/formations/ajouter"}>
          <button className="flex flex-row bg-blue-600 text-white  px-6 py-2 rounded-md space-x-2">
            <PlusIcon />
            <span className="text-l font-bold">Ajouter</span>
          </button>
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  Title
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Domain
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Access
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Formateur
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Modules
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Participants
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {formations.map((formation) => (
                <tr
                  key={formation.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      {/* {formation.image && (
                        <Image
                          src={formation.image}
                          alt={formation.titre}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                          width={10}
                          height={10}
                        />
                      )} */}
                      <div>
                        <div className="font-medium">{formation.titre}</div>
                        <div className="text-sm text-gray-500">
                          {formation.domaine}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                      {formation.domaine}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        formation.accessType === "private"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {formation.accessType.charAt(0).toUpperCase() +
                        formation.accessType.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="font-medium">
                        {formation.formateur.nom}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-2">{formation.modules.length}</span>
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600 mr-1"></div>
                      Modules
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {formation.participants.length}
                      </span>
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1"></div>
                      Participants
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        formation.archived
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {formation.archived ? "Archived" : "Active"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
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
      </div>
    </div>
  );
};

export default Formations;

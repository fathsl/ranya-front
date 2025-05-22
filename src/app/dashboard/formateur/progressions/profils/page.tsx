"use client";

import React from "react";
import { FaChartLine, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const profils = [
  {
    name: "Alice Dupont",
    email: "alice@example.com",
    formation: "React",
    progression: 92,
    score: 88,
    lastLogin: "2025-04-20",
    certificat: true,
  },
  {
    name: "Marc Lemoine",
    email: "marc@example.com",
    formation: "HTML",
    progression: 60,
    score: 50,
    lastLogin: "2025-04-15",
    certificat: false,
  },
];

export default function ProfilPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">👤 Suivi des Profils</h1>
      <p className="text-sm text-gray-600 mb-6">Vue détaillée des participants & performance.</p>

      <div className="overflow-auto bg-white shadow rounded-xl border border-gray-100">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">Nom</th>
              <th className="p-4">Email</th>
              <th className="p-4">Formation</th>
              <th className="p-4">Progression</th>
              <th className="p-4">Score</th>
              <th className="p-4">Dernière Connexion</th>
              <th className="p-4">Certificat</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profils.map((p, i) => (
              <tr key={i} className="border-t">
                <td className="p-4 font-semibold">{p.name}</td>
                <td className="p-4">{p.email}</td>
                <td className="p-4">{p.formation}</td>
                <td className="p-4">{p.progression}%</td>
                <td className="p-4">{p.score}%</td>
                <td className="p-4">{p.lastLogin}</td>
                <td className="p-4">
                  {p.certificat ? (
                    <span className="text-green-600"><FaCheckCircle className="inline" /> Oui</span>
                  ) : (
                    <span className="text-gray-400"><FaTimesCircle className="inline" /> Non</span>
                  )}
                </td>
                <td className="p-4 space-x-2">
                  <button className="text-blue-600 text-sm hover:underline">Voir Profil</button>
                  <button className="text-orange-600 text-sm hover:underline">Ajouter une note</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

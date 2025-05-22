"use client";
import React, { useState } from "react";
import Link from "next/link";

// Simuler l'ID du formateur connecté
const currentFormateurId = "f001";

// Type Participant
type Participant = {
  id: string;
  name: string;
  email: string;
  status: "Actif" | "Inactif";
  formation: string;
  formateur: string;
  formateurId: string;
  niveau: "Débutant" | "Intermédiaire" | "Avancé";
  score: number;
  certificat: boolean;
};

export default function ListeParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "p001",
      name: "Alice Dupont",
      email: "alice@example.com",
      status: "Actif",
      formation: "React & TypeScript",
      formateur: "M. Karim",
      formateurId: "f001",
      niveau: "Intermédiaire",
      score: 88,
      certificat: true,
    },
    {
      id: "p002",
      name: "Marc Lemoine",
      email: "marc@example.com",
      status: "Actif",
      formation: "HTML Débutant",
      formateur: "M. Karim",
      formateurId: "f001",
      niveau: "Débutant",
      score: 45,
      certificat: false,
    },
  ]);

  // Filtrer uniquement les participants de ce formateur
  const myParticipants = participants.filter(
    (p) => p.formateurId === currentFormateurId
  );

  // 🔁 Fonctions d'actions
  const updateParticipant = (id: string, changes: Partial<Participant>) => {
    const updated = participants.map((p) =>
      p.id === id ? { ...p, ...changes } : p
    );
    setParticipants(updated);
  };

  const sendEmailReminder = (email: string) => {
    alert(`✉️ Rappel envoyé à ${email}`);
  };

  const disableAccess = (id: string) => {
    updateParticipant(id, { status: "Inactif" });
    alert("🔒 Accès désactivé !");
  };

  const generateCertificate = (id: string) => {
    updateParticipant(id, { certificat: true });
    alert("🎓 Certificat généré !");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        👥 Mes Participants
      </h1>

      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Formation</th>
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Certificat</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Dashboard</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myParticipants.map((p) => (
              <tr
                key={p.id}
                className="border-t hover:bg-gray-50 transition-all"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {p.name}
                </td>
                <td className="px-4 py-3">{p.email}</td>
                <td className="px-4 py-3">{p.formation}</td>
                <td className="px-4 py-3">{p.niveau}</td>
                <td className="px-4 py-3">{p.score}%</td>
                <td className="px-4 py-3">
                  {p.certificat ? (
                    <span className="text-green-600 font-semibold">🎓 Oui</span>
                  ) : (
                    <span className="text-gray-400">Non</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      p.status === "Actif"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/profils/${p.id}`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    👁️ Voir
                  </Link>
                </td>
                <td className="px-4 py-3 space-y-1 text-xs text-left">
                  <button
                    onClick={() => sendEmailReminder(p.email)}
                    className="text-blue-500 hover:underline block"
                  >
                    ✉️ Envoyer rappel
                  </button>
                  <button
                    onClick={() => disableAccess(p.id)}
                    className="text-red-500 hover:underline block"
                  >
                    🔒 Désactiver accès
                  </button>
                  {!p.certificat && (
                    <button
                      onClick={() => generateCertificate(p.id)}
                      className="text-green-600 hover:underline block"
                    >
                      🎓 Générer certificat
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

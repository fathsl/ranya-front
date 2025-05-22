"use client";

import React from "react";

const alertes = [
  {
    nom: "Alice Dupont",
    raison: "⏱️ Inactivité de 5 jours",
    action: "Envoyer rappel automatique",
  },
  {
    nom: "Marc Lemoine",
    raison: "📉 Score inférieur à 50%",
    action: "Suggérer module d’aide",
  },
  {
    nom: "Lina Bensalah",
    raison: "📅 Deadline de module dépassée",
    action: "Notifier par email",
  },
];

export default function AlertesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">🚨 Alertes & Actions</h1>
      <p className="mb-4 text-gray-600">Toutes les alertes générées par l’IA : inactivité, résultats faibles, délais non respectés.</p>

      <div className="grid gap-6">
        {alertes.map((a, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{a.nom}</h3>
              <p className="text-sm text-gray-500">{a.raison}</p>
            </div>
            <button className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded hover:bg-red-100 transition">
              {a.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

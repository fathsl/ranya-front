"use client";
import React from "react";

export default function BibliothequeRessources() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">📚 Bibliothèque de Ressources</h1>
      <p className="mb-4 text-gray-600">Gérez vos fichiers pédagogiques, vidéos et documents utiles pour vos formations.</p>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded mb-4">
          + Ajouter une ressource
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResourceCard title="Cours HTML" type="PDF" />
          <ResourceCard title="Vidéo sur React.js" type="Vidéo" />
          {/* → boucle à remplacer avec données réelles */}
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ title, type }: { title: string; type: string }) {
  return (
    <div className="border rounded p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{type}</p>
      <div className="mt-2 flex gap-2">
        <button className="text-sm text-blue-600 hover:underline">Prévisualiser</button>
        <button className="text-sm text-green-600 hover:underline">Modifier</button>
        <button className="text-sm text-red-600 hover:underline">Supprimer</button>
      </div>
    </div>
  );
}

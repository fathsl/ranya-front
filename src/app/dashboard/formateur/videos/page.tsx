"use client";

import React from "react";

const chapters = [
  { time: "00:00", title: "Introduction à React" },
  { time: "02:15", title: "useState & useEffect" },
  { time: "08:40", title: "QCM Interactif #1" },
  { time: "12:00", title: "Conclusion" },
];

export default function VideosPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">🎬 Vidéos & Quiz interactifs</h1>
      <p className="mb-6 text-gray-600">Suivez la vidéo du cours avec navigation par chapitres et intégration de quiz pendant le visionnage.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <video controls className="w-full">
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la vidéo.
          </video>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700">📂 Chapitres</h3>
          <ul className="space-y-2">
            {chapters.map((ch, idx) => (
              <li key={idx} className="text-sm text-gray-600 hover:text-orange-600 cursor-pointer">
                {ch.time} - {ch.title}
              </li>
            ))}
          </ul>

          <div className="mt-6 bg-yellow-50 p-4 rounded-md border border-yellow-300">
            <h4 className="font-semibold text-yellow-700 mb-2">📊 Quiz Live</h4>
            <p className="text-sm text-yellow-600">Un QCM interactif apparaîtra après 8min40 de vidéo pour valider la compréhension.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

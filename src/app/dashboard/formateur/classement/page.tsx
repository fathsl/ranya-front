"use client";

import React, { useState, useEffect } from "react";
import {
  FaMedal,
  FaTrophy,
  FaSearch,
  FaCrown,
  FaFilePdf,
  FaCertificate,
  FaDownload,
} from "react-icons/fa";
import jsPDF from "jspdf";

type Participant = {
  id: string;
  name: string;
  formation: string;
  score: number;
  certificat: boolean;
};

const participantsData: Participant[] = [
  { id: "p1", name: "Alice Dupont", formation: "React", score: 98, certificat: true },
  { id: "p2", name: "Marc Lemoine", formation: "React", score: 87, certificat: true },
  { id: "p3", name: "Lina Bensalah", formation: "HTML", score: 72, certificat: false },
  { id: "p4", name: "Kevin Doss", formation: "HTML", score: 66, certificat: false },
  { id: "p5", name: "Amine Khoudir", formation: "React", score: 91, certificat: true },
];

export default function ClassementPage() {
  const [formation, setFormation] = useState("Tous");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const formations = ["Tous", ...new Set(participantsData.map((p) => p.formation))];

  const filtered = participantsData
    .filter(
      (p) =>
        (formation === "Tous" || p.formation === formation) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.score - a.score);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("certHistory");
      if (stored) setHistory(JSON.parse(stored));
    } catch (error) {
      console.error("Erreur lecture historique", error);
    }
  }, []);

  const updateHistory = (line: string) => {
    const updated = [...history, line];
    localStorage.setItem("certHistory", JSON.stringify(updated));
    setHistory(updated);
  };

  const generatePDF = (p: Participant) => {
    try {
      const doc = new jsPDF("landscape");

      doc.setFontSize(24);
      doc.setTextColor(33, 37, 41);
      doc.text("CERTIFICAT DE FORMATION", 90, 30);

      doc.setFontSize(16);
      doc.text(`Ce certificat est décerné à`, 90, 50);
      doc.setFontSize(20);
      doc.text(p.name, 90, 65);

      doc.setFontSize(16);
      doc.text(`Pour avoir complété la formation :`, 90, 80);
      doc.setFontSize(18);
      doc.text(`"${p.formation}" avec un score de ${p.score}%`, 90, 95);
      doc.setFontSize(14);
      doc.text(`Délivré le : ${new Date().toLocaleDateString()}`, 90, 115);

      // Optionnel : si tu as les images disponibles
      const logo = new Image();
      logo.src = "/logo-cert.png";
      logo.onload = () => {
        doc.addImage(logo, "PNG", 10, 10, 30, 30);
        const signature = new Image();
        signature.src = "/signature-cert.png";
        signature.onload = () => {
          doc.addImage(signature, "PNG", 220, 130, 40, 15);
          doc.text("Responsable pédagogique", 220, 150);
          doc.save(`certificat_${p.name}.pdf`);
        };
      };

      updateHistory(`${p.name} - ${p.formation} - ${new Date().toLocaleDateString()}`);
    } catch (error) {
      console.error("Erreur génération PDF", error);
    }
  };

  const downloadBadge = (p: Participant) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      ctx.fillStyle = "#F97316";
      ctx.fillRect(0, 0, 300, 100);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`🏅 ${p.name}`, 20, 40);
      ctx.fillText(`🔥 ${p.formation} - ${p.score}%`, 20, 70);

      const link = document.createElement("a");
      link.download = `badge_${p.name}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Erreur téléchargement badge", err);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">🏆 Classement & Certificats</h1>

      {/* Filtres */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          className="border rounded px-3 py-1 text-sm"
          value={formation}
          onChange={(e) => setFormation(e.target.value)}
        >
          {formations.map((f, i) => (
            <option key={i} value={f}>
              {f}
            </option>
          ))}
        </select>

        <div className="flex items-center border rounded px-3 py-1 bg-white shadow-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto bg-white shadow border border-gray-100 rounded-xl">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Nom</th>
              <th className="p-4">Formation</th>
              <th className="p-4">Score</th>
              <th className="p-4">Certificat</th>
              <th className="p-4">Badge</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className={`border-t ${i === 0 ? "bg-yellow-50" : ""}`}>
                <td className="p-4 font-bold text-gray-700">
                  {i + 1}
                  {i === 0 && <FaCrown className="inline ml-1 text-yellow-500" />}
                </td>
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.formation}</td>
                <td className="p-4">{p.score}%</td>
                <td className="p-4">
                  {p.score >= 65 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <FaCertificate /> Oui
                    </span>
                  ) : (
                    <span className="text-gray-400">Non</span>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => downloadBadge(p)}
                    className="text-amber-600 hover:underline text-sm"
                  >
                    🏷️ Badge
                  </button>
                </td>
                <td className="p-4">
                  {p.score >= 65 ? (
                    <button
                      onClick={() => generatePDF(p)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      📥 Certificat
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">Score insuffisant</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Historique */}
      <div className="mt-10 bg-gray-50 p-4 rounded border text-sm text-gray-700">
        <h3 className="text-md font-semibold text-orange-600 mb-2">📜 Historique</h3>
        {history.length === 0 ? (
          <p className="text-gray-400 italic">Aucun certificat généré.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {history.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaPlus,
  FaCheck,
  FaTimes,
  FaPaperPlane,
  FaChartBar,
  FaEnvelope,
  FaTrash,
} from "react-icons/fa";

// 👤 Participant lié au rappel
type Participant = {
  id: string;
  name: string;
  email: string;
};

// 📌 Rappel lié à un participant
type Reminder = {
  id: number;
  message: string;
  delay: string;
  type: "inactivité" | "progression";
  stats: {
    open: number;
    click: number;
  };
  participant: Participant;
};

export default function NotificationsPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    message: "",
    delay: "",
    type: "inactivité",
    participant: {
      name: "",
      email: "",
      id: "",
    },
  });

  // Charger les rappels depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem("rappelsV2");
    if (stored) {
      setReminders(JSON.parse(stored));
    }
  }, []);

  const saveReminders = (data: Reminder[]) => {
    localStorage.setItem("rappelsV2", JSON.stringify(data));
    setReminders(data);
  };

  const handleAdd = () => {
    if (
      !form.message.trim() ||
      !form.delay.trim() ||
      !form.participant.name.trim() ||
      !form.participant.email.trim()
    ) {
      alert("❗ Tous les champs sont obligatoires.");
      return;
    }

    const newReminder: Reminder = {
      id: Date.now(),
      message: form.message,
      delay: form.delay,
      type: form.type as "inactivité" | "progression",
      stats: { open: 0, click: 0 },
      participant: {
        ...form.participant,
        id: Date.now().toString(),
      },
    };

    const updated = [...reminders, newReminder];
    saveReminders(updated);
    setShowForm(false);
    setForm({
      message: "",
      delay: "",
      type: "inactivité",
      participant: { name: "", email: "", id: "" },
    });
  };

  const handleSend = (r: Reminder) => {
    // Ici tu peux intégrer Supabase / Sendgrid / SMTP...
    console.log(`Envoi simulé à ${r.participant.email} : ${r.message}`);

    const updated = reminders.map((item) =>
      item.id === r.id
        ? {
            ...item,
            stats: {
              open: item.stats.open + 1,
              click: item.stats.click + Math.floor(Math.random() * 2),
            },
          }
        : item
    );
    saveReminders(updated);
    alert("📩 Mail simulé comme envoyé !");
  };

  const handleDelete = (id: number) => {
    const updated = reminders.filter((r) => r.id !== id);
    saveReminders(updated);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">
        🔔 Notifications & Rappels
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Créez des rappels intelligents liés à chaque participant, envoyez par
        email, et suivez les clics.
      </p>

      {/* Liste des rappels */}
      <div className="space-y-4">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-white rounded border shadow-sm hover:shadow-md transition flex justify-between items-start"
          >
            <div>
              <p className="font-semibold text-gray-800 mb-1">{r.message}</p>
              <p className="text-sm text-gray-600">
                👤 <strong>{r.participant.name}</strong> — {r.participant.email}
              </p>
              <p className="text-xs text-gray-500">
                ⏱ Délai : {r.delay} • 📌 Type : {r.type}
              </p>
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-2">
                <FaChartBar className="text-sm" />
                Ouvertures : {r.stats.open} • Clics : {r.stats.click}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => handleSend(r)}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1"
              >
                <FaPaperPlane /> Envoyer
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-red-500 text-xs hover:underline"
              >
                <FaTrash /> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire d'ajout */}
      <div className="mt-8">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            <FaPlus /> Ajouter un rappel
          </button>
        ) : (
          <div className="mt-6 max-w-md bg-white border p-4 rounded shadow space-y-3">
            <h3 className="text-md font-semibold text-gray-700">🆕 Nouveau rappel</h3>

            <input
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border p-2 rounded text-sm"
            />
            <input
              placeholder="Délai (ex: 3j ou auto)"
              value={form.delay}
              onChange={(e) => setForm({ ...form, delay: e.target.value })}
              className="w-full border p-2 rounded text-sm"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border p-2 rounded text-sm"
            >
              <option value="inactivité">Inactivité</option>
              <option value="progression">Progression</option>
            </select>
            <hr />
            <input
              placeholder="Nom du participant"
              value={form.participant.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  participant: { ...form.participant, name: e.target.value },
                })
              }
              className="w-full border p-2 rounded text-sm"
            />
            <input
              type="email"
              placeholder="Email du participant"
              value={form.participant.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  participant: { ...form.participant, email: e.target.value },
                })
              }
              className="w-full border p-2 rounded text-sm"
            />

            <div className="flex justify-between mt-2">
              <button
                onClick={handleAdd}
                className="bg-green-600 text-white text-sm px-4 py-1 rounded hover:bg-green-700"
              >
                Valider
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-red-500 text-sm flex items-center gap-1"
              >
                <FaTimes /> Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

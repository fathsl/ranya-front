"use client";
import React, { useState } from "react";
import { FaUserPlus, FaFileCsv, FaLink, FaQrcode } from "react-icons/fa";

export default function InvitationParticipants() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">✉️ Inviter des Participants</h1>
      <p className="mb-8 text-gray-600">
        Choisissez une méthode pour inviter vos participants : saisie manuelle, import par fichier CSV, lien sécurisé ou QR Code.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InviteCard
          icon={<FaUserPlus size={32} className="text-blue-500" />}
          title="Manuel"
          description="Ajoutez manuellement chaque adresse email."
          isActive={activeSection === "manuel"}
          onClick={() => setActiveSection(activeSection === "manuel" ? null : "manuel")}
        >
          <ManuelInterface />
        </InviteCard>
        <InviteCard
          icon={<FaFileCsv size={32} className="text-green-600" />}
          title="Import CSV"
          description="Téléversez un fichier CSV contenant vos participants."
          isActive={activeSection === "csv"}
          onClick={() => setActiveSection(activeSection === "csv" ? null : "csv")}
        >
          <CsvInterface />
        </InviteCard>
        <InviteCard
          icon={<FaLink size={32} className="text-purple-600" />}
          title="Lien sécurisé"
          description="Générez un lien unique pour que les participants s'inscrivent eux-mêmes."
          isActive={activeSection === "lien"}
          onClick={() => setActiveSection(activeSection === "lien" ? null : "lien")}
        >
          <LienInterface />
        </InviteCard>
        <InviteCard
          icon={<FaQrcode size={32} className="text-orange-500" />}
          title="QR Code"
          description="Affichez un QR Code à scanner pendant une session en direct."
          isActive={activeSection === "qrcode"}
          onClick={() => setActiveSection(activeSection === "qrcode" ? null : "qrcode")}
        >
          <QrCodeInterface />
        </InviteCard>
      </div>
    </div>
  );
}

// ----- Composant carte principale -----
function InviteCard({
  title,
  description,
  icon,
  children,
  onClick,
  isActive,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <div className="border p-6 rounded-lg shadow-sm bg-white flex flex-col justify-between h-full relative">
      <div>
        <div className="mb-4">{icon}</div>
        <h3 className="font-semibold text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-6 inline-block bg-orange-500 text-white text-sm px-4 py-2 rounded hover:bg-orange-600 transition"
      >
        Continuer
      </button>

      {isActive && <div className="mt-6 border-t pt-4">{children}</div>}
    </div>
  );
}

// ----- Interfaces internes -----

function ManuelInterface() {
  const [email, setEmail] = useState("");

  const handleAdd = () => {
    alert(`Invitation envoyée à : ${email}`);
    setEmail("");
  };

  return (
    <div className="text-sm text-gray-700">
      <label>Email participant :</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 block w-full border p-2 rounded"
        placeholder="exemple@mail.com"
      />
      <button
        onClick={handleAdd}
        className="mt-2 bg-orange-500 text-white px-4 py-1 rounded"
      >
        Ajouter
      </button>
    </div>
  );
}

function CsvInterface() {
  return (
    <div className="text-sm text-gray-700">
      <label>Fichier CSV :</label>
      <input type="file" accept=".csv" className="mt-1 block w-full" />
      <button className="mt-2 bg-orange-500 text-white px-4 py-1 rounded">
        Importer
      </button>
    </div>
  );
}

function LienInterface() {
  const generatedLink = "https://ton-plateforme.com/invite/abc123";

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Lien copié !");
  };

  return (
    <div className="text-sm text-gray-700">
      <p>Lien généré :</p>
      <input
        readOnly
        className="mt-1 block w-full border p-2 rounded"
        value={generatedLink}
      />
      <button
        onClick={copyLink}
        className="mt-2 bg-orange-500 text-white px-4 py-1 rounded"
      >
        Copier
      </button>
    </div>
  );
}

function QrCodeInterface() {
  return (
    <div className="text-sm text-gray-700">
      <p>QR Code à scanner :</p>
      <div className="mt-2">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ton-plateforme.com/invite/abc123"
          alt="QR Code"
          className="w-32 h-32"
        />
      </div>
    </div>
  );
}

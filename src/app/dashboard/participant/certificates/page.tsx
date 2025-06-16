"use client";

import CertificateViewModal from "@/components/CertificateView";
import { useAuth } from "@/contexts/authContext";
import {
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  SearchIcon,
  TrophyIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Formateur {
  id: string;
  nom: string;
  email: string;
}

interface ModuleEntity {
  id: string;
  titre: string;
}

interface Participant {
  id: string;
  nom: string;
  email: string;
}

interface Formation {
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

interface Certificate {
  id: string;
  nomParticipant: string;
  formation: string;
  formationEntity?: Formation;
  dateObtention: string;
  urlPdf: string;
}

export default function CertificatesList() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setFormations] = useState<Formation[]>([]);
  const [selectedCertificateId, setSelectedCertificateId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://127.0.0.1:3001/formations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Formation[] = await response.json();
        // Filter out archived formations for participants
        const activeFormations = data.filter(
          (formation: Formation) => !formation.archived
        );
        setFormations(activeFormations);
      } catch (error: any) {
        setError(error.message || "Unknown error");
        console.error("Error fetching formations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://127.0.0.1:3001/certificats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Certificate[] = await response.json();

        // More flexible name matching
        const userCertificates = data.filter((certificate: Certificate) => {
          if (!user?.name || !certificate.nomParticipant) return false;

          const userName = user.name.toLowerCase().trim();
          const participantName = certificate.nomParticipant
            .toLowerCase()
            .trim();

          // Check for exact match
          if (participantName === userName) return true;

          // Check if user name is contained in participant name
          if (participantName.includes(userName)) return true;

          // Check if participant name is contained in user name
          if (userName.includes(participantName)) return true;

          // Split names and check for partial matches
          const userNameParts = userName.split(/\s+/);
          const participantNameParts = participantName.split(/\s+/);

          // Check if any part of user name matches any part of participant name
          return userNameParts.some((userPart) =>
            participantNameParts.some(
              (participantPart) =>
                userPart === participantPart && userPart.length > 2 // Avoid matching very short names
            )
          );
        });

        setCertificates(userCertificates);
      } catch (error: any) {
        setError(error.message || "Unknown error");
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.name) {
      fetchCertificates();
    }
  }, [user?.name]);

  const uniqueDomains = useMemo(() => {
    const domains = certificates
      .map((cert) => cert.formationEntity?.domaine)
      .filter((domain): domain is string => Boolean(domain));
    return [...new Set(domains)];
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((certificate) => {
      const matchesSearch =
        searchTerm === "" ||
        certificate.formation
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        certificate.formationEntity?.formateur?.nom
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        certificate.formationEntity?.domaine
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesDomain =
        selectedDomain === "all" ||
        certificate.formationEntity?.domaine === selectedDomain;

      return matchesSearch && matchesDomain;
    });
  }, [certificates, searchTerm, selectedDomain]);

  const handleDownloadCertificate = (
    certificateId: string,
    fileName: string
  ) => {
    console.log("Télécharger certificat:", certificateId, fileName);

    const certificate = certificates.find((cert) => cert.id === certificateId);
    if (!certificate) {
      console.error("Certificate not found");
      return;
    }

    generateCertificatePDF(certificate, fileName);
  };

  const generateCertificatePDF = (certificate: any, fileName: string) => {
    import("jspdf")
      .then(({ default: jsPDF }) => {
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFillColor(240, 253, 244);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        doc.setLineWidth(2);
        doc.setDrawColor(5, 150, 105);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        doc.setLineWidth(1);
        doc.setDrawColor(245, 158, 11);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        const cornerSize = 15;
        doc.setFillColor(245, 158, 11);

        doc.triangle(15, 15, 15 + cornerSize, 15, 15, 15 + cornerSize, "F");
        doc.triangle(
          pageWidth - 15,
          15,
          pageWidth - 15 - cornerSize,
          15,
          pageWidth - 15,
          15 + cornerSize,
          "F"
        );
        doc.triangle(
          15,
          pageHeight - 15,
          15 + cornerSize,
          pageHeight - 15,
          15,
          pageHeight - 15 - cornerSize,
          "F"
        );
        doc.triangle(
          pageWidth - 15,
          pageHeight - 15,
          pageWidth - 15 - cornerSize,
          pageHeight - 15,
          pageWidth - 15,
          pageHeight - 15 - cornerSize,
          "F"
        );

        doc.setFontSize(32);
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
        const titleText = "CERTIFICAT DE FORMATION";
        const titleWidth = doc.getTextWidth(titleText);
        doc.text(titleText, (pageWidth - titleWidth) / 2, 40);

        doc.setLineWidth(3);
        doc.setDrawColor(245, 158, 11);
        doc.line(
          (pageWidth - titleWidth) / 2,
          45,
          (pageWidth + titleWidth) / 2,
          45
        );

        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        const certifyText = "Nous certifions par les présentes que";
        const certifyWidth = doc.getTextWidth(certifyText);
        doc.text(certifyText, (pageWidth - certifyWidth) / 2, 65);

        doc.setFontSize(24);
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
        const studentName = certificate.nomParticipant || "Participant";
        const nameWidth = doc.getTextWidth(studentName);
        doc.text(studentName, (pageWidth - nameWidth) / 2, 85);

        doc.setLineWidth(2);
        doc.setDrawColor(245, 158, 11);
        doc.line(
          (pageWidth - nameWidth) / 2 - 10,
          90,
          (pageWidth + nameWidth) / 2 + 10,
          90
        );

        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        const completedText = "a terminé avec succès la formation";
        const completedWidth = doc.getTextWidth(completedText);
        doc.text(completedText, (pageWidth - completedWidth) / 2, 105);

        doc.setFontSize(20);
        doc.setTextColor(14, 165, 233);
        doc.setFont("helvetica", "bold");
        const formationTitle =
          certificate.formationEntity?.titre ||
          certificate.formation ||
          fileName ||
          "Formation";
        const formationWidth = doc.getTextWidth(formationTitle);
        doc.text(formationTitle, (pageWidth - formationWidth) / 2, 125);

        if (certificate.formationEntity?.domaine) {
          doc.setFillColor(220, 252, 231);
          doc.setDrawColor(5, 150, 105);
          doc.setLineWidth(1);
          const domainText = certificate.formationEntity.domaine.toUpperCase();
          const domainWidth = doc.getTextWidth(domainText) + 20;
          doc.roundedRect(
            (pageWidth - domainWidth) / 2,
            135,
            domainWidth,
            12,
            3,
            3,
            "FD"
          );

          doc.setFontSize(10);
          doc.setTextColor(5, 150, 105);
          doc.setFont("helvetica", "bold");
          doc.text(
            domainText,
            (pageWidth - doc.getTextWidth(domainText)) / 2,
            143
          );
        }

        doc.setFontSize(14);
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");

        let certificateDate = new Date();
        if (certificate.dateObtention) {
          certificateDate = new Date(certificate.dateObtention);
        }

        const formattedDate = certificateDate.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const dateText = `Délivré le ${formattedDate}`;
        const dateWidth = doc.getTextWidth(dateText);
        doc.text(dateText, (pageWidth - dateWidth) / 2, 165);

        if (certificate.formationEntity?.formateur?.nom) {
          doc.setFontSize(12);
          doc.setTextColor(60, 60, 60);
          doc.setFont("helvetica", "normal");

          const instructorText = "Formateur:";
          doc.text(instructorText, pageWidth - 80, pageHeight - 40);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(5, 150, 105);
          doc.text(
            certificate.formationEntity.formateur.nom,
            pageWidth - 80,
            pageHeight - 30
          );

          doc.setLineWidth(1);
          doc.setDrawColor(180, 180, 180);
          doc.line(
            pageWidth - 80,
            pageHeight - 25,
            pageWidth - 20,
            pageHeight - 25
          );
        }

        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont("helvetica", "normal");
        const certId = certificate.id ? certificate.id.substring(0, 8) : "N/A";
        doc.text(`ID: ${certId}`, 20, pageHeight - 20);

        doc.setFillColor(245, 158, 11, 0.1);
        doc.circle(pageWidth - 50, 50, 20, "F");
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(2);
        doc.circle(pageWidth - 50, 50, 20);

        doc.setFontSize(10);
        doc.setTextColor(245, 158, 11);
        doc.setFont("helvetica", "bold");
        const sealText = "CERTIFIÉ";
        const sealWidth = doc.getTextWidth(sealText);
        doc.text(sealText, pageWidth - 50 - sealWidth / 2, 52);

        const fileName_clean = fileName.replace(/[^a-zA-Z0-9]/g, "_");
        const participantName_clean = (
          certificate.nomParticipant || "Participant"
        ).replace(/\s+/g, "_");

        doc.save(`Certificat_${fileName_clean}_${participantName_clean}.pdf`);

        console.log("Certificate PDF generated successfully");
      })
      .catch((error) => {
        console.error("Error generating PDF certificate:", error);
        alert("Erreur lors de la génération du certificat PDF");
      });
  };

  const handleViewCertificate = (certificateId) => {
    console.log("Voir certificat:", certificateId);
    setSelectedCertificateId(certificateId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCertificateId(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos certificats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <TrophyIcon size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrophyIcon size={32} className="text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Mes Certificats
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Consultez et téléchargez vos certificats de formation obtenus
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher un certificat, formation, formateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <FilterIcon size={20} className="text-gray-500" />
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[200px]"
              >
                <option value="all">Tous les domaines</option>
                {uniqueDomains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCertificates.length} certificat
            {filteredCertificates.length !== 1 ? "s" : ""} obtenu
            {filteredCertificates.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <div
              key={certificate.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div
                className="h-48 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 relative overflow-hidden"
                style={{
                  backgroundImage: certificate.formationEntity?.image
                    ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${certificate.formationEntity.image})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute top-4 right-4">
                  <div className="bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                    <AwardIcon size={20} />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold mb-1 line-clamp-2">
                    {certificate.formationEntity?.titre ||
                      certificate.formation}
                  </h3>
                  <p className="text-white/90 text-sm">
                    Par{" "}
                    {certificate.formationEntity?.formateur?.nom ||
                      "Formateur inconnu"}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                    {certificate.formationEntity?.domaine || "Non spécifié"}
                  </span>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Obtenu le {formatDate(certificate.dateObtention)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpenIcon size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-600">
                      Formation:{" "}
                      {certificate.formationEntity?.titre ||
                        certificate.formation}
                    </span>
                  </div>
                </div>

                {certificate.formationEntity?.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {certificate.formationEntity.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewCertificate(certificate.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <EyeIcon size={16} />
                    <span className="text-sm font-medium">Voir</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadCertificate(
                        certificate.id,
                        certificate.formationEntity?.titre ||
                          certificate.formation
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <DownloadIcon size={16} />
                    <span className="text-sm font-medium">Télécharger</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCertificates.length === 0 && certificates.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <AwardIcon size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Aucun certificat trouvé
            </h3>
            <p className="text-gray-500 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDomain("all");
              }}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {certificates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrophyIcon size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Aucun certificat obtenu
            </h3>
            <p className="text-gray-500 mb-6">
              Vous n&apos;avez pas encore obtenu de certificat. Terminez vos
              formations pour en obtenir !
            </p>
            <button
              onClick={() => (window.location.href = "/formations")}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Explorer les formations
            </button>
          </div>
        )}

        <CertificateViewModal
          certificateId={selectedCertificateId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          certificates={certificates}
        />
      </div>
    </div>
  );
}

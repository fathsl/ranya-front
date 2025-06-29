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

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
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
  user: User;
  userId: string;
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
  participants: Participant[];
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

        // Method 1: Fetch certificates for the current user by userId
        const response = await fetch(
          `http://127.0.0.1:3001/certificats/user/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userCertificates: Certificate[] = await response.json();
        setCertificates(userCertificates);
      } catch (error) {
        try {
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
          const userCertificates = data.filter((certificate: Certificate) => {
            if (
              certificate.participants &&
              Array.isArray(certificate.participants)
            ) {
              return certificate.participants.some(
                (participant) => participant.id === user?.id
              );
            }

            if (!user?.name || !certificate.nomParticipant) return false;

            const userName = user.name.toLowerCase().trim();
            const participantName = certificate.nomParticipant
              .toLowerCase()
              .trim();

            // Exact match
            if (participantName === userName) return true;

            // Normalize names by removing extra spaces and special characters
            const normalizeString = (str: string) =>
              str
                .replace(/\s+/g, " ")
                .replace(/[^\w\s]/g, "")
                .trim();

            const normalizedUserName = normalizeString(userName);
            const normalizedParticipantName = normalizeString(participantName);

            if (normalizedParticipantName === normalizedUserName) return true;

            // Split names and check for meaningful matches
            const userNameParts = normalizedUserName
              .split(" ")
              .filter((part) => part.length > 2);
            const participantNameParts = normalizedParticipantName
              .split(" ")
              .filter((part) => part.length > 2);

            // Check if at least 2 name parts match or if there's only one part and it matches
            const matchingParts = userNameParts.filter((userPart) =>
              participantNameParts.some(
                (participantPart) => participantPart === userPart
              )
            );

            return matchingParts.length >= Math.min(2, userNameParts.length);
          });

          setCertificates(userCertificates);
        } catch (fallbackError: any) {
          setError(fallbackError.message || "Unknown error");
          console.error("Error fetching certificates:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCertificates();
    }
  }, [user?.id, user?.name]);

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
        certificate.formationEntity?.user?.name
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

  const generateCertificatePDF = (certificate, fileName) => {
    Promise.all([import("jspdf"), import("qrcode")])
      .then(([{ default: jsPDF }, QRCode]) => {
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Clean white background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        // Elegant main border
        doc.setLineWidth(0.8);
        doc.setDrawColor(34, 34, 34);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Inner border with subtle accent
        doc.setLineWidth(0.3);
        doc.setDrawColor(120, 120, 120);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);

        // Header section - clean and minimal
        const headerY = 35;

        // Company logo area (left side)
        const logoX = 35;
        const logoY = headerY;

        // Simple elegant logo design
        doc.setFillColor(41, 128, 185);
        doc.circle(logoX, logoY, 8, "F");

        doc.setFillColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("edu", logoX - 6, logoY + 2);

        // Company name
        doc.setFontSize(16);
        doc.setTextColor(34, 34, 34);
        doc.setFont("helvetica", "bold");
        doc.text("eduPlatform", logoX + 20, logoY - 3);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Digital Education Excellence", logoX + 20, logoY + 5);

        // QR Code (right side)
        const qrCodeUrl =
          "http://localhost:3000/dashboard/participant/certificates";

        QRCode.toDataURL(qrCodeUrl, {
          width: 120,
          margin: 1,
          color: { dark: "#222222", light: "#ffffff" },
        })
          .then((qrCodeDataUrl) => {
            const qrX = pageWidth - 50;
            const qrY = headerY - 10;

            // QR Code with subtle border
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.rect(qrX - 1, qrY - 1, 22, 22);
            doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, 20, 20);

            // QR Code label
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.setFont("helvetica", "normal");
            doc.text("Verify Certificate", qrX - 5, qrY + 25);

            // Continue with rest of certificate after QR code is ready
            generateCertificateContent();
          })
          .catch((qrError) => {
            console.error("Error generating QR code:", qrError);
            generateCertificateContent();
          });

        function generateCertificateContent() {
          // Main title
          const titleY = 85;
          doc.setFontSize(42);
          doc.setTextColor(34, 34, 34);
          doc.setFont("times", "bold");
          const titleText = "CERTIFICATE";
          const titleWidth = doc.getTextWidth(titleText);
          doc.text(titleText, (pageWidth - titleWidth) / 2, titleY);

          // Subtitle
          doc.setFontSize(14);
          doc.setTextColor(100, 100, 100);
          doc.setFont("times", "normal");
          const subtitleText = "OF COMPLETION";
          const subtitleWidth = doc.getTextWidth(subtitleText);
          doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, titleY + 12);

          // Elegant divider line
          doc.setLineWidth(1);
          doc.setDrawColor(41, 128, 185);
          doc.line(
            (pageWidth - 80) / 2,
            titleY + 20,
            (pageWidth + 80) / 2,
            titleY + 20
          );

          // Award text
          const awardY = titleY + 40;
          doc.setFontSize(14);
          doc.setTextColor(80, 80, 80);
          doc.setFont("times", "normal");
          const awardText = "This certifies that";
          const awardWidth = doc.getTextWidth(awardText);
          doc.text(awardText, (pageWidth - awardWidth) / 2, awardY);

          // Participant name
          const nameY = awardY + 20;
          doc.setFontSize(32);
          doc.setTextColor(34, 34, 34);
          doc.setFont("times", "bold");
          const studentName = certificate.nomParticipant || "Participant Name";
          const nameWidth = doc.getTextWidth(studentName);
          doc.text(studentName, (pageWidth - nameWidth) / 2, nameY);

          // Elegant underline for name
          doc.setLineWidth(0.5);
          doc.setDrawColor(41, 128, 185);
          doc.line(
            (pageWidth - nameWidth) / 2,
            nameY + 3,
            (pageWidth + nameWidth) / 2,
            nameY + 3
          );

          // Achievement description
          const achievementY = nameY + 25;
          doc.setFontSize(14);
          doc.setTextColor(80, 80, 80);
          doc.setFont("times", "normal");
          const achievementText = "has successfully completed";
          const achievementWidth = doc.getTextWidth(achievementText);
          doc.text(
            achievementText,
            (pageWidth - achievementWidth) / 2,
            achievementY
          );

          // Course title
          const courseY = achievementY + 18;
          const formationTitle =
            certificate.formationEntity?.titre ||
            certificate.formation ||
            fileName ||
            "Professional Development Course";

          doc.setFontSize(20);
          doc.setTextColor(41, 128, 185);
          doc.setFont("times", "bold");
          const courseWidth = doc.getTextWidth(formationTitle);
          doc.text(formationTitle, (pageWidth - courseWidth) / 2, courseY);

          // Domain badge (if available)
          let domainY = courseY + 15;
          if (certificate.formationEntity?.domaine) {
            const domainText =
              certificate.formationEntity.domaine.toUpperCase();
            const domainWidth = doc.getTextWidth(domainText) + 16;

            doc.setFillColor(245, 245, 245);
            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.5);
            doc.roundedRect(
              (pageWidth - domainWidth) / 2,
              domainY - 6,
              domainWidth,
              12,
              3,
              3,
              "FD"
            );

            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.setFont("helvetica", "normal");
            doc.text(
              domainText,
              (pageWidth - doc.getTextWidth(domainText)) / 2,
              domainY + 1
            );

            domainY += 20;
          }

          // Date - properly handle dateObtention
          let certificateDate;

          console.log("Certificate dateObtention:", certificate.dateObtention); // Debug log

          if (certificate.dateObtention) {
            certificateDate = new Date(certificate.dateObtention);
            // Check if date is valid
            if (isNaN(certificateDate.getTime())) {
              console.warn("Invalid dateObtention, using current date");
              certificateDate = new Date();
            }
          } else {
            console.log("No dateObtention found, using current date");
            certificateDate = new Date();
          }

          const formattedDate = certificateDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          console.log("Formatted date:", formattedDate); // Debug log

          const dateY = domainY + 25;
          doc.setFontSize(12);
          doc.setTextColor(120, 120, 120);
          doc.setFont("times", "normal");
          const dateText = `Awarded on ${formattedDate}`;
          const dateWidth = doc.getTextWidth(dateText);

          console.log(
            "Date text:",
            dateText,
            "at position:",
            (pageWidth - dateWidth) / 2,
            dateY
          ); // Debug log

          doc.text(dateText, (pageWidth - dateWidth) / 2, dateY);

          // Signature section
          const signatureY = pageHeight - 40;

          // Left signature - Instructor
          if (certificate.formationEntity?.formateur?.nom) {
            const leftSigX = 60;

            doc.setFontSize(10);
            doc.setTextColor(120, 120, 120);
            doc.setFont("times", "normal");
            doc.text("Instructor", leftSigX, signatureY - 10);

            doc.setFontSize(14);
            doc.setFont("times", "bold");
            doc.setTextColor(34, 34, 34);
            doc.text(
              certificate.formationEntity.formateur.nom,
              leftSigX,
              signatureY
            );

            // Signature line
            doc.setLineWidth(0.5);
            doc.setDrawColor(180, 180, 180);
            doc.line(leftSigX, signatureY + 3, leftSigX + 50, signatureY + 3);
          }

          // Right signature - Director
          const rightSigX = pageWidth - 110;

          doc.setFontSize(14);
          doc.setFont("times", "bold");
          doc.setTextColor(34, 34, 34);
          doc.text(`Awarded on ${formattedDate}`, rightSigX, signatureY);

          // Signature line
          doc.setLineWidth(0.5);
          doc.setDrawColor(180, 180, 180);
          doc.line(rightSigX, signatureY + 3, rightSigX + 50, signatureY + 3);

          // Certificate ID
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.setFont("helvetica", "normal");
          const certId = certificate.id
            ? certificate.id.substring(0, 8).toUpperCase()
            : "EDU12345";
          doc.text(`Certificate ID: ${certId}`, 25, pageHeight - 10);

          // Save the PDF
          const fileName_clean = fileName.replace(/[^a-zA-Z0-9]/g, "_");
          const participantName_clean = (
            certificate.nomParticipant || "Participant"
          ).replace(/\s+/g, "_");

          doc.save(
            `Certificate_${fileName_clean}_${participantName_clean}.pdf`
          );
          console.log("Elegant certificate PDF generated successfully");
        }
      })
      .catch((error) => {
        console.error("Error generating PDF certificate:", error);
        alert("Error generating certificate PDF");
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

  const getImageUrl = (imageName: string | null | undefined) => {
    if (!imageName) return null;

    if (imageName.startsWith("http") || imageName.startsWith("/uploads/")) {
      return imageName;
    }

    return `/uploads/${imageName}`;
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
                className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden"
                style={{
                  backgroundImage: certificate.formationEntity?.image
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${getImageUrl(
                        certificate.formationEntity?.image
                      )})`
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
                    {certificate.formationEntity?.user?.name ||
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
          handleDownload={handleDownloadCertificate}
        />
      </div>
    </div>
  );
}

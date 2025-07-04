"use client";

import { useAuth } from "@/contexts/authContext";
import {
  AwardIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  PlayIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
  order: number;
  formationId: string;
}

interface EvaluationTest {
  id?: string;
  isEnabled: boolean;
  title: string;
  timeLimit: number;
  passingScore: number;
  description: string;
  questions: Question[];
}

interface UserAnswer {
  questionId: string;
  answer: string;
}

interface Participant {
  id: string;
  nom: string;
  email: string;
}

interface User {
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
  user: User;
  userId: string;
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

const EvaluationTestInterface = () => {
  const params = useParams();
  const formationId = params.formationId as string;
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluationTest, setEvaluationTest] = useState<EvaluationTest | null>(
    null
  );
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [formation, setFormation] = useState<Formation | null>(null);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://127.0.0.1:3001/formations/${formationId}`,
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

        const data = await response.json();
        setFormation(data);
      } catch (error: any) {
        setError(error.message || "Failed to fetch formation details");
        console.error("Error fetching formation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formationId) {
      fetchFormation();
    }
  }, [formationId]);

  useEffect(() => {
    const fetchEvaluationData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching data for formationId:", formationId);

        // Fetch evaluation test by formationId
        const evaluationTestResponse = await fetch(
          `http://127.0.0.1:3001/evaluation-tests?formationId=${formationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!evaluationTestResponse.ok) {
          throw new Error(
            `Failed to fetch evaluation test: ${evaluationTestResponse.statusText}`
          );
        }

        const evaluationTestData = await evaluationTestResponse.json();
        console.log("Evaluation test data:", evaluationTestData);

        // Handle if evaluationTestData is an array or single object
        const evalTest = Array.isArray(evaluationTestData)
          ? evaluationTestData.find((test) => test.formationId === formationId)
          : evaluationTestData;

        if (!evalTest || !evalTest.isEnabled) {
          throw new Error("No evaluation test available for this formation");
        }

        // Fetch questions by formationId
        const questionsResponse = await fetch(
          `http://127.0.0.1:3001/questions?formationId=${formationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!questionsResponse.ok) {
          throw new Error(
            `Failed to fetch questions: ${questionsResponse.statusText}`
          );
        }

        const questionsData = await questionsResponse.json();
        console.log("All questions data:", questionsData);

        // Filter questions by formationId and sort by order
        const formationQuestions = questionsData
          .filter((q: Question) => {
            console.log(
              `Question ${q.id} formationId: "${
                q.formationId
              }" (type: ${typeof q.formationId})`
            );
            console.log(
              `Target formationId: "${formationId}" (type: ${typeof formationId})`
            );

            // Convert both to strings for comparison to handle type mismatches
            const questionFormationId = String(q.formationId).trim();
            const targetFormationId = String(formationId).trim();

            return questionFormationId === targetFormationId;
          })
          .sort((a: Question, b: Question) => a.order - b.order);

        console.log("Filtered questions:", formationQuestions);
        console.log("Number of questions found:", formationQuestions.length);

        if (formationQuestions.length === 0) {
          console.warn("No questions found for this formation");
          setError("No questions available for this evaluation test");
          return;
        }

        setEvaluationTest(evalTest);
        setQuestions(formationQuestions);
      } catch (err) {
        console.error("Error fetching evaluation data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch evaluation data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (formationId && formationId.trim() !== "") {
      fetchEvaluationData();
    } else {
      console.error("No valid formationId provided");
      setError("No formation ID provided");
      setLoading(false);
    }
  }, [formationId]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);

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

            if (participantName === userName) return true;

            const normalizeString = (str: string) =>
              str
                .replace(/\s+/g, " ")
                .replace(/[^\w\s]/g, "")
                .trim();

            const normalizedUserName = normalizeString(userName);
            const normalizedParticipantName = normalizeString(participantName);

            if (normalizedParticipantName === normalizedUserName) return true;

            const userNameParts = normalizedUserName
              .split(" ")
              .filter((part) => part.length > 2);
            const participantNameParts = normalizedParticipantName
              .split(" ")
              .filter((part) => part.length > 2);

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

  useEffect(() => {
    if (testStarted && !testCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted, timeRemaining]);

  const startTest = () => {
    if (questions.length === 0 || !evaluationTest) {
      console.error("Cannot start test: no questions or evaluation test");
      return;
    }
    setTestStarted(true);
    setTimeRemaining(evaluationTest.timeLimit * 60);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, answer } : a
        );
      }
      return [...prev, { questionId, answer }];
    });
  };

  const calculateResults = () => {
    if (questions.length === 0 || !evaluationTest) return null;

    let totalScore = 0;
    let totalPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = userAnswers.find((a) => a.questionId === question.id);

      if (
        userAnswer &&
        userAnswer.answer !== undefined &&
        userAnswer.answer !== ""
      ) {
        if (question.type === "multiple-choice") {
          const userAnswerValue = String(userAnswer.answer).trim();
          const correctAnswerValue = String(question.correctAnswer).trim();
          if (userAnswerValue === correctAnswerValue) {
            totalScore += question.points;
          } else if (question.options && Array.isArray(question.options)) {
            let userIndex = userAnswerValue;
            if (isNaN(parseInt(userAnswerValue))) {
              userIndex = question.options
                .findIndex(
                  (option) =>
                    String(option).toLowerCase().trim() ===
                    userAnswerValue.toLowerCase()
                )
                .toString();
            }

            let correctIndex = correctAnswerValue;
            if (isNaN(parseInt(correctAnswerValue))) {
              correctIndex = question.options
                .findIndex(
                  (option) =>
                    String(option).toLowerCase().trim() ===
                    correctAnswerValue.toLowerCase()
                )
                .toString();
            }

            if (userIndex === correctIndex && userIndex !== "-1") {
              totalScore += question.points;
            }
          }
        } else if (question.type === "true-false") {
          const userBool = userAnswer.answer.toLowerCase();
          const correctBool = question.correctAnswer.toLowerCase();
          if (userBool === correctBool) {
            totalScore += question.points;
          }
        } else if (question.type === "short-answer") {
          const userText = userAnswer.answer.toLowerCase().trim();
          const correctText = question.correctAnswer.toLowerCase().trim();

          if (
            userText === correctText ||
            userText.includes(correctText) ||
            correctText.includes(userText)
          ) {
            totalScore += question.points;
          }
        }
      }
    });

    const percentage =
      totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
    const passed = percentage >= evaluationTest.passingScore;

    return {
      score: totalScore,
      totalPoints,
      percentage,
      passed,
    };
  };

  const handleSubmitTest = async () => {
    const results = calculateResults();
    if (!results) return;

    setTestCompleted(true);
    setTestResults(results);

    if (results.passed) {
      await handleGenerateCertificate();
    }
  };

  const handleGenerateCertificate = async () => {
    setIsGeneratingCertificate(true);

    const requestBody = {
      participantId: user?.id,
      formationId: formationId,
      nomParticipant: user?.name,
      formation: evaluationTest?.title || "Formation Evaluation",
    };

    try {
      const response = await fetch("http://127.0.0.1:3001/certificats/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate certificate");
      }

      const certificate = await response.json();
      console.log("Certificate generated:", certificate);
      setCertificateGenerated(true);
    } catch (error) {
      console.error("Error generating certificate:", error);
      setError("Error generating certificate: " + (error as Error).message);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCurrentAnswer = (questionId: string) => {
    const answer = userAnswers.find((a) => a.questionId === questionId);
    return answer?.answer || "";
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

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

          // Date
          let certificateDate = new Date();
          if (certificate.dateObtention) {
            certificateDate = new Date(certificate.dateObtention);
          }

          const formattedDate = certificateDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const dateY = domainY + 15;
          doc.setFontSize(12);
          doc.setTextColor(120, 120, 120);
          doc.setFont("times", "normal");
          const dateText = `Awarded on ${formattedDate}`;
          const dateWidth = doc.getTextWidth(dateText);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Loading Test
            </h3>
            <p className="text-gray-600">
              Preparing your evaluation questions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Error Loading Test
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FileTextIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Questions Available
            </h3>
            <p className="text-gray-600 mb-4">
              No evaluation questions found for this formation.
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Formation ID: {formationId}
            </div>
            <button
              onClick={() => {
                console.log("Debug info:", {
                  formationId,
                  evaluationTest,
                  questionsLength: questions.length,
                });
                window.location.reload();
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reload & Debug
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (testCompleted && testResults) {
    const isPassed = testResults.passed;

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${
          isPassed
            ? "from-green-50 via-emerald-50 to-teal-50"
            : "from-red-50 via-pink-50 to-red-50"
        } flex items-center justify-center`}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            {isPassed ? (
              <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
            ) : (
              <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
            )}

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {isPassed ? "🎉 Congratulations!" : "📚 Keep Learning"}
            </h2>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {testResults.score}
                  </div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {testResults.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {testResults.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Your Score</span>
                <span className="text-sm font-semibold text-gray-800">
                  {testResults.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    isPassed ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(testResults.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">0%</span>
                <span className="text-xs text-gray-500">
                  Passing: {evaluationTest?.passingScore}%
                </span>
                <span className="text-xs text-gray-500">100%</span>
              </div>
            </div>

            {isPassed ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <AwardIcon className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-green-800 font-semibold">
                      Certificate Earned!
                    </span>
                  </div>
                  <p className="text-green-700 text-sm">
                    You&apos;ve successfully passed the evaluation and earned
                    your certificate.
                  </p>
                </div>

                {isGeneratingCertificate ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600 mr-2"></div>
                      <span className="text-blue-800">
                        Generating your certificate...
                      </span>
                    </div>
                  </div>
                ) : certificateGenerated ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-semibold">
                        Certificate Generated!
                      </span>
                    </div>
                    {certificates.map((certificate) => (
                      <button
                        onClick={() =>
                          handleDownloadCertificate(
                            certificate.id,
                            certificate.formationEntity?.titre ||
                              certificate.formation
                          )
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center mx-auto flex-col flex space-y-2"
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download Certificate
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href={"/dashboard/participant/formations"}>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-colors">
                      Back to Course
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm">
                    You need at least {evaluationTest?.passingScore}% to pass.
                    Review the material and try again!
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                  >
                    Retake Test
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-colors">
                    Review Material
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pre-test start screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FileTextIcon className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {evaluationTest?.title}
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              {evaluationTest?.description}
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <ClockIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {evaluationTest?.timeLimit} Minutes
                  </div>
                  <div className="text-sm text-gray-600">Time Limit</div>
                </div>
                <div className="text-center">
                  <FileTextIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {questions.length} Questions
                  </div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                <div className="text-center">
                  <AwardIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-semibold text-gray-800">
                    {evaluationTest?.passingScore}%
                  </div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                Important Instructions:
              </h3>
              <ul className="text-blue-700 text-sm space-y-1 text-left">
                <li>
                  • You have {evaluationTest?.timeLimit} minutes to complete all
                  questions
                </li>
                <li>
                  • You can navigate between questions but cannot pause the
                  timer
                </li>
                <li>• Make sure you have a stable internet connection</li>
                <li>
                  • You need {evaluationTest?.passingScore}% or higher to
                  receive a certificate
                </li>
              </ul>
            </div>

            <button
              onClick={startTest}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center mx-auto"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test in progress
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = getCurrentAnswer(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with timer and progress */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {evaluationTest?.title}
              </h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-orange-600">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="font-mono text-lg font-semibold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {currentQuestion.type.replace("-", " ").toUpperCase()}
              </span>
              <span className="text-gray-600 text-sm">
                {currentQuestion.points} points
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="mb-8">
            {currentQuestion.type === "multiple-choice" &&
              currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                        currentAnswer === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={currentAnswer === option}
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion.id, e.target.value)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                          currentAnswer === option
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {currentAnswer === option && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-gray-700 flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              )}

            {currentQuestion.type === "true-false" && (
              <div className="space-y-3">
                {["true", "false"].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-blue-50 ${
                      currentAnswer === option
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={currentAnswer === option}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        currentAnswer === option
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {currentAnswer === option && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "short-answer" && (
              <textarea
                value={currentAnswer}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
              />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-6 py-3 rounded-xl transition-all ${
                currentQuestionIndex === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                Answered Questions
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {userAnswers.length} / {questions.length}
              </div>
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitTest}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Submit Test
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all flex items-center"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationTestInterface;

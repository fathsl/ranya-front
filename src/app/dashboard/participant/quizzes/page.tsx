"use client";

import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FilterIcon,
  PlayIcon,
  TrophyIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";

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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  description: string;
  moduleId: string;
  formationId: string;
  isActive: boolean;
  questions: QuizQuestion[];
  module: ModuleEntity;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
}

const QuizPage = () => {
  const { user } = useAuth();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");

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

        const data = await response.json();

        const userFormations = data.filter((formation: Formation) => {
          if (formation.archived) return false;

          if (formation.accessType === "public") return true;

          if (!user?.id || !formation.participants) return false;

          return formation.participants.some(
            (participant: Participant) => participant.id === user.id
          );
        });

        setFormations(userFormations);
      } catch (error: any) {
        setError(error.message || "Unknown error");
        console.error("Error fetching formations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFormations();
    }
  }, [user?.id]);

  const fetchQuizzes = async (formationId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use the correct quiz endpoint from your controller
      const response = await fetch(
        `http://127.0.0.1:3001/quizzes/formation/${formationId}`,
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

      const result = await response.json();

      if (result.success) {
        const activeQuizzes = result.data.filter((quiz: Quiz) => quiz.isActive);
        setQuizzes(activeQuizzes);
      } else {
        throw new Error(result.message || "Failed to fetch quizzes");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch quizzes");
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormationSelect = (formation: Formation) => {
    setSelectedFormation(formation);
    setCurrentQuiz(null);
    setQuizCompleted(false);
    setQuizResults(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    fetchQuizzes(formation.id);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizResults(null);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (
      currentQuiz &&
      currentQuestionIndex < currentQuiz.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;

    const correctAnswers = currentQuiz.questions.reduce((count, question) => {
      return selectedAnswers[question.id] === question.correctAnswer
        ? count + 1
        : count;
    }, 0);

    const results: QuizResults = {
      totalQuestions: currentQuiz.questions.length,
      correctAnswers,
      score: Math.round((correctAnswers / currentQuiz.questions.length) * 100),
      passed: correctAnswers / currentQuiz.questions.length >= 0.6,
    };

    setQuizResults(results);
    setQuizCompleted(true);
  };

  const filteredFormations = formations.filter((formation) => {
    const matchesSearch =
      formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain =
      selectedDomain === "all" || formation.domaine === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const uniqueDomains = [...new Set(formations.map((f) => f.domaine))];

  if (loading && formations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4 mx-auto"></div>
          <p className="text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  // Quiz Taking Interface
  if (currentQuiz && !quizCompleted) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentQuiz(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon size={20} />
                <span>Retour aux quiz</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClockIcon size={16} />
                <span>
                  Question {currentQuestionIndex + 1} sur{" "}
                  {currentQuiz.questions.length}
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {currentQuiz.description}
            </h1>
            <p className="text-gray-600 mb-4">
              {selectedFormation?.titre} - {currentQuiz.module.titre}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswers[currentQuestion.id] === index
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswers[currentQuestion.id] === index
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedAnswers[currentQuestion.id] === index && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeftIcon size={16} />
              Précédent
            </button>

            {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={
                  Object.keys(selectedAnswers).length !==
                  currentQuiz.questions.length
                }
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <CheckCircleIcon size={16} />
                Terminer le quiz
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestion.id] === undefined}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Suivant
                <ArrowRightIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Results Interface
  if (quizCompleted && quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                quizResults.passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {quizResults.passed ? (
                <TrophyIcon size={40} className="text-green-600" />
              ) : (
                <XCircleIcon size={40} className="text-red-600" />
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">
              {quizResults.passed ? "Félicitations !" : "Quiz terminé"}
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Vous avez obtenu {quizResults.score}% (
              {quizResults.correctAnswers}/{quizResults.totalQuestions} bonnes
              réponses)
            </p>

            <div
              className={`inline-block px-6 py-3 rounded-full text-lg font-semibold mb-8 ${
                quizResults.passed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {quizResults.passed ? "Quiz réussi" : "Quiz échoué"}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setCurrentQuiz(null);
                  setQuizCompleted(false);
                  setQuizResults(null);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retour aux quiz
              </button>
              {currentQuiz && (
                <button
                  onClick={() => handleStartQuiz(currentQuiz)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
                >
                  Reprendre le quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {selectedFormation
              ? `Quiz - ${selectedFormation.titre}`
              : "Quiz Disponibles"}
          </h1>
          <p className="text-gray-600 text-lg">
            {selectedFormation
              ? "Testez vos connaissances avec ces quiz"
              : "Sélectionnez une formation pour accéder aux quiz"}
          </p>
        </div>

        {!selectedFormation ? (
          <>
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher une formation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FilterIcon size={20} className="text-gray-500" />
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
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

            {/* Formations Grid */}
            {filteredFormations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFormations.map((formation) => (
                  <div
                    key={formation.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
                    onClick={() => handleFormationSelect(formation)}
                  >
                    <div className="h-48 bg-gradient-to-br from-green-500 to-blue-600 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-bold mb-1">
                          {formation.titre}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {formation.domaine}
                        </p>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {formation.description}
                      </p>

                      <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium">
                        Voir les quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpenIcon
                  size={64}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Aucune formation disponible
                </h3>
                <p className="text-gray-500">
                  Vous n&apos;êtes inscrit à aucune formation pour le moment
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => setSelectedFormation(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon size={20} />
                <span>Retour aux formations</span>
              </button>
            </div>

            {/* Quiz Grid */}
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpenIcon size={20} className="text-green-600" />
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                          {quiz.module.titre}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {quiz.description}
                      </h3>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <UserIcon size={16} />
                          <span>{quiz.questions.length} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon size={16} />
                          <span>
                            {new Date(quiz.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium"
                      >
                        <PlayIcon size={16} />
                        Commencer le quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <BookOpenIcon
                  size={64}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Aucun quiz disponible
                </h3>
                <p className="text-gray-500">
                  Il n&apos;y a actuellement aucun quiz actif pour cette
                  formation
                </p>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4 mx-auto"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;

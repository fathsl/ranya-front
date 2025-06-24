import { ChevronLeftIcon, TrophyIcon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
  module: {
    id: string;
    titre: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
}

interface QuizComponentProps {
  moduleId: string;
  onClose: () => void;
  onScoreUpdate: (moduleId: string, score: number) => void;
  user: any; // Replace with your user type
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  moduleId,
  onClose,
  onScoreUpdate,
  user,
}) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch quiz for the module
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:3001/quizzes/module/${moduleId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch quiz");
        }
        const result = await response.json();

        // Check if the response follows the expected format from your backend
        if (!result.success) {
          throw new Error(result.message || "Failed to fetch quiz");
        }

        // Get the first active quiz from the data array
        const activeQuizzes = result.data.filter((quiz: Quiz) => quiz.isActive);

        if (activeQuizzes.length === 0) {
          throw new Error("No active quizzes found for this module");
        }

        const quizData = activeQuizzes[0]; // Take the first active quiz

        // Validate that the quiz has questions
        if (
          !quizData.questions ||
          !Array.isArray(quizData.questions) ||
          quizData.questions.length === 0
        ) {
          throw new Error("Quiz has no questions available");
        }

        setQuiz(quizData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [moduleId]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const saveQuizScore = async (score: number) => {
    try {
      if (!quiz?.id) {
        throw new Error("Quiz ID not available");
      }

      const response = await fetch(`http://127.0.0.1:3001/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Add the score or any other fields you want to update
          // Note: You might need to adjust this based on your UpdateQuizDto structure
          lastScore: score,
          lastAttemptUserId: user.id,
          lastAttemptDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz score");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to save quiz score");
      }

      // Update the parent component's state
      onScoreUpdate(moduleId, score);

      console.log("Quiz score saved successfully:", result.data);
    } catch (err) {
      console.error("Error saving quiz score:", err);
      // You might want to show an error message to the user
      throw err; // Re-throw to handle in the calling function if needed
    }
  };
  const handleSubmitQuiz = async () => {
    if (!quiz || !quiz.questions) return;

    setSubmitting(true);

    const correctAnswers = quiz.questions.reduce((count, question) => {
      return selectedAnswers[question.id] === question.correctAnswer
        ? count + 1
        : count;
    }, 0);

    const results: QuizResults = {
      totalQuestions: quiz.questions.length,
      correctAnswers,
      score: Math.round((correctAnswers / quiz.questions.length) * 100),
      passed: correctAnswers / quiz.questions.length >= 0.6,
    };

    setQuizResults(results);
    setQuizCompleted(true);

    // Save score to backend
    await saveQuizScore(results.score);

    setSubmitting(false);
  };

  const isQuizAnswered = () => {
    return (
      quiz?.questions?.every((q) => selectedAnswers[q.id] !== undefined) ||
      false
    );
  };

  // Add this helper to safely get the current question
  const getCurrentQuestion = (): QuizQuestion | null => {
    if (!quiz?.questions || currentQuestionIndex >= quiz.questions.length) {
      return null;
    }
    return quiz.questions[currentQuestionIndex];
  };

  // Helper to safely get module title
  const getModuleTitle = (): string => {
    return quiz?.module?.titre || "Module";
  };

  // Early returns for loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2 mx-auto"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-600 mb-4">
          No quiz available for this module.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">Error loading question.</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  // Quiz interface - add the actual quiz UI here
  if (quizCompleted && quizResults) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              quizResults.passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {quizResults.passed ? (
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {quizResults.passed ? "Congratulations!" : "Quiz Complete"}
          </h2>

          <p className="text-lg text-gray-600 mb-4">
            Score: {quizResults.score}% ({quizResults.correctAnswers}/
            {quizResults.totalQuestions} correct)
          </p>

          <div
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              quizResults.passed
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {quizResults.passed ? "Passed" : "Failed"}
          </div>

          <div className="space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 hover:bg-white/10 px-3 py-1 rounded transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </button>
          <div className="text-sm">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{quiz.description}</h1>
        <p className="text-blue-100">Module: {getModuleTitle()}</p>

        {/* Progress Bar */}
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion.id, index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion.id] === index
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswers[currentQuestion.id] === index
                      ? "border-blue-500 bg-blue-500"
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
      <div className="border-t bg-gray-50 px-6 py-4 flex justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={!isQuizAnswered() || submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
export default QuizComponent;

import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardCheckIcon,
  ClockIcon,
  EditIcon,
  FileTextIcon,
  PlusIcon,
  TargetIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
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
  evaluationTestId: string;
}

interface EvaluationTest {
  id?: string;
  isEnabled: boolean;
  title: string;
  timeLimit: number;
  passingScore: number;
  description: string;
  questions: Question[];
  formationId: string;
  formation?: FormationEntity;
}

interface FormationEntity {
  id: string;
  titre: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface EvaluationTestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationTests: EvaluationTest[];
  formations: FormationEntity[];
  onUpdateTest: (
    testId: string,
    updatedTest: Partial<EvaluationTest>
  ) => Promise<void>;
  onDeleteTest: (testId: string) => Promise<void>;
  onCreateTest: (newTest: Omit<EvaluationTest, "id">) => Promise<void>;
}

const EvaluationTestsDrawer: React.FC<EvaluationTestsDrawerProps> = ({
  isOpen,
  onClose,
  evaluationTests,
  formations,
  onUpdateTest,
  onDeleteTest,
  onCreateTest,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState<EvaluationTest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Questions state
  const [questions, setQuestions] = useState<{ [testId: string]: Question[] }>(
    {}
  );
  const [loadingQuestions, setLoadingQuestions] = useState<{
    [testId: string]: boolean;
  }>({});
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [creatingQuestion, setCreatingQuestion] = useState<string | null>(null);
  const [deleteConfirmQuestionId, setDeleteConfirmQuestionId] = useState<
    string | null
  >(null);

  const [editForm, setEditForm] = useState<Partial<EvaluationTest>>({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    isEnabled: false,
    formationId: "",
  });

  const [questionForm, setQuestionForm] = useState<Partial<Question>>({
    type: "multiple-choice",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1,
    explanation: "",
    order: 1,
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedTest(null);
      setIsEditing(false);
      setIsCreating(false);
      setDeleteConfirmId(null);
      setSearchTerm("");
      setExpandedTestId(null);
      setEditingQuestion(null);
      setCreatingQuestion(null);
      setDeleteConfirmQuestionId(null);
      resetForm();
      resetQuestionForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditForm({
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 70,
      isEnabled: false,
      formationId: "",
    });
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
      explanation: "",
      order: 1,
    });
  };
  const fetchQuestions = async (evaluationTestId: string) => {
    setLoadingQuestions((prev) => ({ ...prev, [evaluationTestId]: true }));
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/questions?evaluationTestId=${evaluationTestId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("data", data);
        setQuestions((prev) => ({ ...prev, [evaluationTestId]: data }));
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoadingQuestions((prev) => ({ ...prev, [evaluationTestId]: false }));
    }
  };

  const createQuestion = async (
    evaluationTestId: string,
    questionData: Omit<Question, "id">
  ) => {
    try {
      const response = await fetch("http://127.0.0.1:3001/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...questionData, evaluationTestId }),
      });

      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions((prev) => ({
          ...prev,
          [evaluationTestId]: [...(prev[evaluationTestId] || []), newQuestion],
        }));
        return newQuestion;
      }
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  };

  const updateQuestion = async (
    questionId: string,
    questionData: Partial<Question>
  ) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/questions/${questionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionData),
        }
      );

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestions((prev) => {
          const newQuestions = { ...prev };
          Object.keys(newQuestions).forEach((testId) => {
            newQuestions[testId] = newQuestions[testId].map((q) =>
              q.id === questionId ? updatedQuestion : q
            );
          });
          return newQuestions;
        });
        return updatedQuestion;
      }
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setQuestions((prev) => {
          const newQuestions = { ...prev };
          Object.keys(newQuestions).forEach((testId) => {
            newQuestions[testId] = newQuestions[testId].filter(
              (q) => q.id !== questionId
            );
          });
          return newQuestions;
        });
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  };

  const handleEdit = (test: EvaluationTest) => {
    setSelectedTest(test);
    setEditForm({
      title: test.title,
      description: test.description,
      timeLimit: test.timeLimit,
      passingScore: test.passingScore,
      isEnabled: test.isEnabled,
      formationId: test.formationId,
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.formationId) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      if (isCreating) {
        await onCreateTest({
          ...(editForm as Omit<EvaluationTest, "id">),
          questions: [],
        });
      } else if (selectedTest?.id) {
        await onUpdateTest(selectedTest.id, editForm);
      }

      setIsEditing(false);
      setIsCreating(false);
      setSelectedTest(null);
      resetForm();
    } catch (error) {
      console.error("Error saving test:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId: string) => {
    setLoading(true);
    try {
      await onDeleteTest(testId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuestions = async (testId: string) => {
    if (expandedTestId === testId) {
      setExpandedTestId(null);
    } else {
      setExpandedTestId(testId);
      if (!questions[testId]) {
        await fetchQuestions(testId);
      }
    }
  };

  const handleCreateQuestion = async () => {
    if (
      !creatingQuestion ||
      !questionForm.question ||
      !questionForm.correctAnswer
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const maxOrder = Math.max(
        0,
        ...(questions[creatingQuestion]?.map((q) => q.order) || [])
      );
      await createQuestion(creatingQuestion, {
        ...(questionForm as Omit<Question, "id">),
        order: maxOrder + 1,
      });
      setCreatingQuestion(null);
      resetQuestionForm();
    } catch (error) {
      alert("Erreur lors de la création de la question");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async () => {
    if (
      !editingQuestion ||
      !questionForm.question ||
      !questionForm.correctAnswer
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      await updateQuestion(editingQuestion.id, questionForm);
      setEditingQuestion(null);
      resetQuestionForm();
    } catch (error) {
      alert("Erreur lors de la modification de la question");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      await deleteQuestion(questionId);
      setDeleteConfirmQuestionId(null);
    } catch (error) {
      alert("Erreur lors de la suppression de la question");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      type: question.type,
      question: question.question,
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer,
      points: question.points,
      explanation: question.explanation,
      order: question.order,
    });
  };

  const filteredTests = evaluationTests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formations
        .find((f) => f.id === test.formationId)
        ?.titre.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getFormationTitle = (formationId: string) => {
    return (
      formations.find((f) => f.id === formationId)?.titre ||
      "Formation inconnue"
    );
  };

  const renderQuestionForm = () => (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h4 className="font-medium text-gray-900 mb-4">
        {editingQuestion ? "Modifier la question" : "Nouvelle question"}
      </h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de question
          </label>
          <select
            value={questionForm.type}
            onChange={(e) =>
              setQuestionForm({
                ...questionForm,
                type: e.target.value as Question["type"],
                options:
                  e.target.value === "multiple-choice"
                    ? ["", "", "", ""]
                    : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="multiple-choice">Choix multiple</option>
            <option value="true-false">Vrai/Faux</option>
            <option value="short-answer">Réponse courte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            value={questionForm.question}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, question: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Saisissez votre question..."
          />
        </div>

        {questionForm.type === "multiple-choice" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options de réponse
            </label>
            {questionForm.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(questionForm.options || [])];
                    newOptions[index] = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOptions });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Option ${index + 1}`}
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={questionForm.correctAnswer === option}
                  onChange={() =>
                    setQuestionForm({ ...questionForm, correctAnswer: option })
                  }
                  className="w-4 h-4 text-blue-600"
                />
              </div>
            ))}
          </div>
        )}

        {questionForm.type === "true-false" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Réponse correcte
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="correctAnswer"
                  value="true"
                  checked={questionForm.correctAnswer === "true"}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      correctAnswer: e.target.value,
                    })
                  }
                  className="w-4 h-4 text-blue-600 mr-2"
                />
                Vrai
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="correctAnswer"
                  value="false"
                  checked={questionForm.correctAnswer === "false"}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      correctAnswer: e.target.value,
                    })
                  }
                  className="w-4 h-4 text-blue-600 mr-2"
                />
                Faux
              </label>
            </div>
          </div>
        )}

        {questionForm.type === "short-answer" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Réponse correcte *
            </label>
            <input
              type="text"
              value={questionForm.correctAnswer}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  correctAnswer: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Réponse attendue"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              value={questionForm.points}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  points: parseInt(e.target.value),
                })
              }
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordre
            </label>
            <input
              type="number"
              value={questionForm.order}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  order: parseInt(e.target.value),
                })
              }
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explication (optionnel)
          </label>
          <textarea
            value={questionForm.explanation}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, explanation: e.target.value })
            }
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Explication de la réponse..."
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={
              editingQuestion ? handleUpdateQuestion : handleCreateQuestion
            }
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Sauvegarde..." : editingQuestion ? "Modifier" : "Créer"}
          </button>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setCreatingQuestion(null);
              resetQuestionForm();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-5xl h-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <ClipboardCheckIcon className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Tests d&apos;évaluation
                </h2>
                <p className="text-sm text-gray-600">
                  {evaluationTests.length} test
                  {evaluationTests.length > 1 ? "s" : ""} disponible
                  {evaluationTests.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {/* Search and Create */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon size={16} />
              Nouveau test
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isEditing || isCreating ? (
            /* Edit/Create Form */
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isCreating ? "Créer un nouveau test" : "Modifier le test"}
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du test *
                    </label>
                    <input
                      type="text"
                      value={editForm.title || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom du test d'évaluation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description du test..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formation *
                    </label>
                    <select
                      value={editForm.formationId || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          formationId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner une formation</option>
                      {formations.map((formation) => (
                        <option key={formation.id} value={formation.id}>
                          {formation.titre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée (minutes)
                      </label>
                      <input
                        type="number"
                        value={editForm.timeLimit || 30}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            timeLimit: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Score de passage (%)
                      </label>
                      <input
                        type="number"
                        value={editForm.passingScore || 70}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            passingScore: parseInt(e.target.value),
                          })
                        }
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isEnabled"
                      checked={editForm.isEnabled || false}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          isEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isEnabled"
                      className="text-sm font-medium text-gray-700"
                    >
                      Test activé
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckIcon size={16} />
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                      setSelectedTest(null);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTests.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardCheckIcon
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm
                      ? "Aucun test trouvé"
                      : "Aucun test d'évaluation"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? "Essayez de modifier votre recherche"
                      : "Commencez par créer votre premier test d'évaluation"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                    >
                      Créer un test
                    </button>
                  )}
                </div>
              ) : (
                filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <div className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {test.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                test.isEnabled
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {test.isEnabled ? "ACTIF" : "INACTIF"}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-3">
                            {test.description || "Aucune description"}
                          </p>

                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FileTextIcon size={14} />
                              <span>{getFormationTitle(test.formationId)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon size={14} />
                              <span>{test.timeLimit}min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TargetIcon size={14} />
                              <span>{test.passingScore}% requis</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClipboardCheckIcon size={14} />
                              <span>
                                {questions[test.id!]?.length || 0} question
                                {(questions[test.id!]?.length || 0) > 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleToggleQuestions(test.id!)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title={
                              expandedTestId === test.id
                                ? "Masquer les questions"
                                : "Voir les questions"
                            }
                          >
                            {expandedTestId === test.id ? (
                              <ChevronUpIcon size={16} />
                            ) : (
                              <ChevronDownIcon size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(test)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(test.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2Icon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Questions Section */}
                    {expandedTestId === test.id && (
                      <div className="px-6 pb-6 bg-gray-50">
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-medium text-gray-900">
                              Questions du test
                            </h4>
                            <button
                              onClick={() => setCreatingQuestion(test.id!)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Ajouter une question
                            </button>
                          </div>

                          {/* Question Creation Form */}
                          {creatingQuestion === test.id && renderQuestionForm()}

                          {/* Question Editing Form */}
                          {editingQuestion &&
                            editingQuestion.evaluationTestId === test.id &&
                            renderQuestionForm()}

                          {/* Questions List */}
                          {loadingQuestions[test.id!] ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="text-sm text-gray-500 mt-2">
                                Chargement des questions...
                              </p>
                            </div>
                          ) : questions[test.id!]?.length > 0 ? (
                            <div className="space-y-3">
                              {questions[test.id!]
                                .sort((a, b) => a.order - b.order)
                                .map((question, index) => (
                                  <div
                                    key={question.id}
                                    className="bg-white p-4 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-sm font-medium text-gray-500">
                                            Question {index + 1}
                                          </span>
                                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            {question.type === "multiple-choice"
                                              ? "Choix multiple"
                                              : question.type === "true-false"
                                              ? "Vrai/Faux"
                                              : "Réponse courte"}
                                          </span>
                                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            {question.points} point
                                            {question.points > 1 ? "s" : ""}
                                          </span>
                                        </div>

                                        <p className="text-gray-900 mb-2 font-medium">
                                          {question.question}
                                        </p>

                                        {question.type === "multiple-choice" &&
                                          question.options && (
                                            <div className="mb-2">
                                              {question.options.map(
                                                (option, optIndex) => (
                                                  <div
                                                    key={optIndex}
                                                    className={`text-sm p-2 rounded ${
                                                      option ===
                                                      question.correctAnswer
                                                        ? "bg-green-50 text-green-800 font-medium"
                                                        : "text-gray-600"
                                                    }`}
                                                  >
                                                    {String.fromCharCode(
                                                      65 + optIndex
                                                    )}
                                                    . {option}
                                                    {option ===
                                                      question.correctAnswer &&
                                                      " ✓"}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}

                                        {question.type !==
                                          "multiple-choice" && (
                                          <div className="text-sm text-green-800 bg-green-50 p-2 rounded mb-2">
                                            <strong>Réponse correcte:</strong>{" "}
                                            {question.correctAnswer}
                                          </div>
                                        )}

                                        {question.explanation && (
                                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                            <strong>Explication:</strong>{" "}
                                            {question.explanation}
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 ml-4">
                                        <button
                                          onClick={() =>
                                            handleEditQuestion(question)
                                          }
                                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                          title="Modifier"
                                        >
                                          <EditIcon size={14} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setDeleteConfirmQuestionId(
                                              question.id
                                            )
                                          }
                                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                          title="Supprimer"
                                        >
                                          <Trash2Icon size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <ClipboardCheckIcon
                                size={32}
                                className="mx-auto mb-2 opacity-50"
                              />
                              <p>Aucune question pour ce test</p>
                              <p className="text-sm">
                                Cliquez sur &apos;&apos;Ajouter une
                                question&apos; pour commencer
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {deleteConfirmQuestionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette question ? Cette action
              est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmQuestionId(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteQuestion(deleteConfirmQuestionId)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangleIcon className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Supprimer le test
                </h3>
                <p className="text-sm text-gray-600">
                  Cette action est irréversible
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer ce test d&apos;évaluation ?
              Toutes les données associées seront perdues définitivement.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Suppression..." : "Supprimer"}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationTestsDrawer;

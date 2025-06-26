"use client";

import EvaluationTestsDrawer from "@/components/EvaluationTestsDrawer";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  ClockIcon,
  Edit3Icon,
  FolderIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayersIcon,
  PlayIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface ResourceEntity {
  id: string;
  title: string;
  type: string;
  videoLink?: string;
  pdfLink?: string;
  textLink?: string;
  content?: string;
  duration?: number;
  isCompleted: boolean;
  thumbnail?: string;
  description?: string;
  moduleId: string;
  module: ModuleEntity;
  createdAt: string;
  updatedAt: string;
}

interface ModuleEntity {
  id: string;
  titre: string;
  description?: string;
  formationId: string;
  duration?: number;
  order: number;
  formation: FormationEntity;
  resources: ResourceEntity[];
  createdAt: string;
  updatedAt: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  formationId: string;
  isActive: boolean;
  questions: QuizQuestion[];
  module: ModuleEntity;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface FormationEntity {
  id: string;
  titre: string;
  description?: string;
  modules: ModuleEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
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

export interface EvaluationTest {
  id: string;
  isEnabled: boolean;
  title: string;
  timeLimit: number;
  passingScore: number;
  description: string;
  questions: Question[];
  formationId: string;
  formation: FormationEntity;
}

interface EditResourceData {
  title: string;
  type: string;
  videoLink: string;
  pdfLink: string;
  textLink: string;
  content: string;
  duration: number;
  isCompleted: boolean;
  thumbnail: string;
  description: string;
  moduleId: string;
}

const ResourcesInterface = () => {
  const [formations, setFormations] = useState<FormationEntity[]>([]);
  const [modules, setModules] = useState<ModuleEntity[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resources, setResources] = useState<ResourceEntity[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [expandedFormations, setExpandedFormations] = useState(new Set());
  const [selectedResource, setSelectedResource] =
    useState<ResourceEntity | null>(null);
  const [quizzesByModule, setQuizzesByModule] = useState<
    Record<string, Quiz[]>
  >({});
  const [, setLoadingQuizzes] = useState<Record<string, boolean>>({});
  const [evaluationTests, setEvaluationTests] = useState<EvaluationTest[]>([]);

  const [editData, setEditData] = useState<EditResourceData>({
    title: "",
    type: "video",
    videoLink: "",
    pdfLink: "",
    textLink: "",
    content: "",
    duration: 0,
    isCompleted: false,
    thumbnail: "",
    description: "",
    moduleId: "",
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isQuizDrawerOpen, setIsQuizDrawerOpen] = useState(false);
  const [evaluationTestsDrawerOpen, setEvaluationTestsDrawerOpen] =
    useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [isPlayingQuiz, setIsPlayingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [editingQuizData, setEditingQuizData] = useState<Quiz | null>(null);

  useEffect(() => {
    const quizByModule: Record<string, Quiz[]> = {};
    quizzes.forEach((quiz) => {
      if (!quizByModule[quiz.moduleId]) {
        quizByModule[quiz.moduleId] = [];
      }
      quizByModule[quiz.moduleId].push(quiz);
    });
    setQuizzesByModule(quizByModule);
  }, [quizzes]);

  const fetchFormations = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/formations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFormations(data);
      }
    } catch (error) {
      console.error("Error fetching formations:", error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/modules", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/questions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/resources", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const fetchQuizzes = async (moduleId: string) => {
    try {
      setLoadingQuizzes((prev) => ({ ...prev, [moduleId]: true }));

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const activeQuizzes = result.data.filter((quiz: Quiz) => quiz.isActive);
        setQuizzesByModule((prev) => ({
          ...prev,
          [moduleId]: activeQuizzes,
        }));
      } else {
        throw new Error(result.message || "Failed to fetch quizzes");
      }
    } catch (error: any) {
      console.error(`Error fetching quizzes for module ${moduleId}:`, error);
      setQuizzesByModule((prev) => ({
        ...prev,
        [moduleId]: [],
      }));
    } finally {
      setLoadingQuizzes((prev) => ({ ...prev, [moduleId]: false }));
    }
  };

  const fetchAllQuizzes = async () => {
    const moduleIds = modules.map((module) => module.id);
    await Promise.all(moduleIds.map((moduleId) => fetchQuizzes(moduleId)));
  };

  const fetchEvaluationTests = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/evaluation-tests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEvaluationTests(data);
      }
    } catch (error) {
      console.error("Error fetching evaluation tests:", error);
    }
  };

  const updateEvaluationTest = async (
    testId: string,
    updatedTest: Partial<EvaluationTest>
  ) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/evaluation-tests/${testId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTest),
        }
      );

      if (response.ok) {
        const updatedTestData = await response.json();
        setEvaluationTests((prev) =>
          prev.map((test) =>
            test.id === testId ? { ...test, ...updatedTestData } : test
          )
        );
      } else {
        throw new Error("Failed to update evaluation test");
      }
    } catch (error) {
      console.error("Error updating evaluation test:", error);
      throw error;
    }
  };

  const deleteEvaluationTest = async (testId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/evaluation-tests/${testId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setEvaluationTests((prev) => prev.filter((test) => test.id !== testId));
      } else {
        throw new Error("Failed to delete evaluation test");
      }
    } catch (error) {
      console.error("Error deleting evaluation test:", error);
      throw error;
    }
  };

  const createEvaluationTest = async (newTest: Omit<EvaluationTest, "id">) => {
    try {
      const response = await fetch("http://127.0.0.1:3001/evaluation-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTest),
      });

      if (response.ok) {
        const createdTest = await response.json();
        setEvaluationTests((prev) => [...prev, createdTest]);
      } else {
        throw new Error("Failed to create evaluation test");
      }
    } catch (error) {
      console.error("Error creating evaluation test:", error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchFormations();
      await fetchModules();
      await fetchResources();
      await fetchQuestions();
      await fetchEvaluationTests();
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (modules.length > 0) {
      fetchAllQuizzes();
    }
  }, [modules]);

  const getFormationModules = (formationId: string) => {
    return modules.filter((module) => module.formationId === formationId);
  };

  const getFormationQuestions = (formationId: string): Question[] => {
    return questions.filter((question) => question.formationId === formationId);
  };

  const getFormationEvaluationTest = (
    formationId: string
  ): EvaluationTest | null => {
    return (
      evaluationTests.find((test) => test.formationId === formationId) || null
    );
  };

  const getModuleById = (moduleId: string) => {
    return modules.find((module) => module.id === moduleId);
  };

  const getFormationByModuleId = (moduleId: string) => {
    const modulee = getModuleById(moduleId);
    if (!modulee) return null;
    return formations.find((formation) => formation.id === modulee.formationId);
  };

  const handleEdit = (resource: ResourceEntity) => {
    setSelectedResource(resource);
    setEditData({
      title: resource.title,
      type: resource.type,
      videoLink: resource.videoLink || "",
      pdfLink: resource.pdfLink || "",
      textLink: resource.textLink || "",
      content: resource.content || "",
      duration: resource.duration || 0,
      isCompleted: resource.isCompleted,
      thumbnail: resource.thumbnail || "",
      description: resource.description || "",
      moduleId: resource.moduleId,
    });
    setIsEditMenuOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedResource) return;
    setIsUpdating(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/resources/${selectedResource.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to update resource";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      const updatedResource = await response.json();
      setResources((prev) =>
        prev.map((r) => (r.id === selectedResource.id ? updatedResource : r))
      );
      setIsEditMenuOpen(false);
      setSelectedResource(null);
    } catch (error) {
      console.error("Error updating resource:", error);
      alert(`Erreur lors de la mise à jour de la ressource: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`http://127.0.0.1:3001/resources/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete resource";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      setResources((prev) => prev.filter((r) => r.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert(`Erreur lors de la suppression de la ressource: ${error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const getModuleResources = (moduleId: string) => {
    return resources.filter((resource) => resource.moduleId === moduleId);
  };

  const getFormationStats = (formationId: string) => {
    const formationModules = getFormationModules(formationId);

    let totalResources = 0;
    let completedResources = 0;
    let totalDuration = 0;

    formationModules.forEach((module) => {
      const moduleResources = getModuleResources(module.id);
      totalResources += moduleResources.length;
      completedResources += moduleResources.filter((r) => r.isCompleted).length;
      totalDuration += Number(module.duration);
    });

    return { totalResources, completedResources, totalDuration };
  };

  const toggleFormation = (formationId: string) => {
    const newExpanded = new Set(expandedFormations);
    if (newExpanded.has(formationId)) {
      newExpanded.delete(formationId);
    } else {
      newExpanded.add(formationId);
    }
    setExpandedFormations(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayIcon size={16} />;
      case "pdf":
        return <FolderIcon size={16} />;
      default:
        return <FolderIcon size={16} />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      video: "from-red-100 to-pink-100 text-red-800",
      pdf: "from-green-100 to-teal-100 text-green-800",
      text: "from-blue-100 to-indigo-100 text-blue-800",
    };

    return (
      <span
        className={`bg-gradient-to-r ${
          colors[type] || colors.text
        } px-3 py-1 rounded-full text-xs font-medium uppercase`}
      >
        {type}
      </span>
    );
  };

  const createEvaluationTestWithQuestions = (
    formationId: string
  ): EvaluationTest | null => {
    const existingTest = getFormationEvaluationTest(formationId);
    const formationQuestions = getFormationQuestions(formationId);

    if (existingTest) {
      return {
        ...existingTest,
        questions: formationQuestions,
      };
    } else if (formationQuestions.length > 0) {
      return {
        id: `temp-${formationId}`,
        isEnabled: false,
        title: "Test d'évaluation",
        timeLimit: 30,
        passingScore: 70,
        description: "Test d'évaluation automatiquement généré",
        questions: formationQuestions,
        formationId: formationId,
      };
    }

    return null;
  };

  const handleQuizEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setEditingQuizData({ ...quiz });
    setIsEditingQuiz(true);
    setIsPlayingQuiz(false);
    setIsQuizDrawerOpen(true);
  };

  const handleQuizStart = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsPlayingQuiz(true);
    setIsEditingQuiz(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizResults(null);
    setIsQuizDrawerOpen(true);
  };

  const getModuleQuizzes = (moduleId: string) => {
    return quizzesByModule[moduleId] || [];
  };

  const handleQuizSave = async () => {
    if (!editingQuizData) return;

    try {
      const response = await fetch("http://127.0.0.1:3001/quizzes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingQuizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create resource");
      }

      const result = await response.json();

      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((q) =>
          q.id === editingQuizData.id ? editingQuizData : q
        )
      );

      setIsQuizDrawerOpen(false);
      setEditingQuizData(null);

      return result.data;
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (!selectedQuiz) return;

    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate results
      const correctAnswers = selectedQuiz.questions.reduce(
        (count, question, index) => {
          return userAnswers[index] === question.correctAnswer
            ? count + 1
            : count;
        },
        0
      );

      setQuizResults({
        score: correctAnswers,
        total: selectedQuiz.questions.length,
      });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const closeQuizDrawer = () => {
    setIsQuizDrawerOpen(false);
    setSelectedQuiz(null);
    setEditingQuizData(null);
    setIsEditingQuiz(false);
    setIsPlayingQuiz(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizResults(null);
  };

  const addQuestion = () => {
    if (!editingQuizData) return;

    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };

    setEditingQuizData({
      ...editingQuizData,
      questions: [...editingQuizData.questions, newQuestion],
    });
  };

  const updateQuestion = (questionIndex: number, field: string, value: any) => {
    if (!editingQuizData) return;

    const updatedQuestions = editingQuizData.questions.map((q, index) => {
      if (index === questionIndex) {
        return { ...q, [field]: value };
      }
      return q;
    });

    setEditingQuizData({
      ...editingQuizData,
      questions: updatedQuestions,
    });
  };

  const updateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    if (!editingQuizData) return;

    const updatedQuestions = editingQuizData.questions.map((q, index) => {
      if (index === questionIndex) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });

    setEditingQuizData({
      ...editingQuizData,
      questions: updatedQuestions,
    });
  };

  const removeQuestion = (questionIndex: number) => {
    if (!editingQuizData) return;

    const updatedQuestions = editingQuizData.questions.filter(
      (_, index) => index !== questionIndex
    );
    setEditingQuizData({
      ...editingQuizData,
      questions: updatedQuestions,
    });
  };

  const filteredData = useMemo(() => {
    const formationsWithResources = formations.filter((formation) => {
      const stats = getFormationStats(formation.id);
      return stats.totalResources > 0;
    });

    if (!searchTerm) {
      return formationsWithResources;
    }

    return formationsWithResources.filter((formation) => {
      const formationMatch = formation.titre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const formationModules = getFormationModules(formation.id);
      const evaluationTest = createEvaluationTestWithQuestions(formation.id);

      const resourceMatch = formationModules.some((module) =>
        getModuleResources(module.id).some(
          (resource) =>
            resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      );

      const testMatch =
        evaluationTest &&
        (evaluationTest.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          evaluationTest.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          evaluationTest.questions.some((q) =>
            q.question.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      return formationMatch || resourceMatch || testMatch;
    });
  }, [
    searchTerm,
    formations,
    resources,
    modules,
    ,
    questions,
    evaluationTests,
  ]);

  const currentModule = getModuleById(editData.moduleId);
  const currentFormation = currentModule
    ? getFormationByModuleId(editData.moduleId)
    : null;

  const EvaluationTestsButton = () => (
    <button
      onClick={() => setEvaluationTestsDrawerOpen(true)}
      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
    >
      <ClipboardCheckIcon size={16} />
      Tests d&apos;évaluation
    </button>
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Gestion des Ressources
              </h1>
              <p className="text-gray-600 text-lg">
                Gérez les ressources pédagogiques par formation et module
              </p>
            </div>
            <div className="flex flex-row items-start space-x-2">
              <div>
                <EvaluationTestsButton />
              </div>
              {/* <Link href={"/dashboard/formateur/ressources/ajouter"}>
                <button className="flex flex-row bg-blue-600 text-white px-6 py-2 rounded-md space-x-2">
                  <PlusIcon />
                  <span className="text-l font-bold">Ajouter</span>
                </button>
              </Link> */}
            </div>
          </div>

          <div className="relative mb-6">
            <SearchIcon
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher une ressource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm"
            />
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 w-12"></th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Formation / Ressource
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Module
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Durée
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Progression
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((formation) => {
                  const isExpanded = expandedFormations.has(formation.id);
                  const formationModules = getFormationModules(formation.id);
                  const stats = getFormationStats(formation.id);
                  console.log("stats", stats.totalDuration);

                  const progressPercentage =
                    stats.totalResources > 0
                      ? Math.round(
                          (stats.completedResources / stats.totalResources) *
                            100
                        )
                      : 0;

                  return (
                    <React.Fragment key={formation.id}>
                      {/* Formation Row */}
                      <tr className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 hover:from-blue-100/50 hover:to-purple-100/50 transition-all duration-300">
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleFormation(formation.id)}
                            className="p-1 hover:bg-white/50 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon
                                size={20}
                                className="text-gray-600"
                              />
                            ) : (
                              <ChevronRightIcon
                                size={20}
                                className="text-gray-600"
                              />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                              <GraduationCapIcon size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-lg">
                                {formation.titre}
                              </div>

                              <div className="text-xs text-blue-600 mt-1">
                                {stats.totalResources} ressource
                                {stats.totalResources > 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                            FORMATION
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            {formationModules.length} module
                            {formationModules.length > 1 ? "s" : ""}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <ClockIcon size={16} />
                            {stats.totalDuration}min
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                              {progressPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            <FolderIcon className="text-gray-400" size={18} />
                          </div>
                        </td>
                      </tr>

                      {/* Module and Resource Rows */}
                      {isExpanded &&
                        formationModules.map((module) => {
                          const moduleResources = getModuleResources(
                            module.id
                          ).filter((resource) => {
                            if (!searchTerm) return true;
                            return (
                              resource.title
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              resource.description
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            );
                          });
                          const moduleQuizzes = getModuleQuizzes(module.id);

                          return (
                            <React.Fragment key={module.id}>
                              {/* Module Row */}
                              <tr className="bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-300">
                                <td className="py-3 px-6 pl-12">
                                  <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300"></div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center text-white">
                                      <LayersIcon size={16} />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-800">
                                        {module.titre}
                                      </div>
                                      {module.description && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          {module.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <span className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                    MODULE
                                  </span>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="text-sm text-gray-600">
                                    {moduleResources.length} ressource
                                    {moduleResources.length > 1 ? "s" : ""}
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <ClockIcon size={14} />
                                    <span className="text-sm">
                                      {formatDuration(
                                        moduleResources.reduce(
                                          (sum, r) => sum + (r.duration || 0),
                                          0
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="text-sm text-gray-600">
                                    {
                                      moduleResources.filter(
                                        (r) => r.isCompleted
                                      ).length
                                    }
                                    /{moduleResources.length}
                                  </div>
                                </td>
                                <td className="py-3 px-6">
                                  <div className="flex items-center justify-center">
                                    <LayersIcon
                                      className="text-gray-400"
                                      size={16}
                                    />
                                  </div>
                                </td>
                              </tr>

                              {/* Resource Rows */}
                              {moduleResources.map((resource) => (
                                <tr
                                  key={resource.id}
                                  className="hover:bg-blue-50/30 transition-all duration-300 group bg-gray-50/30"
                                >
                                  <td className="py-3 px-6 pl-16">
                                    <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300"></div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white">
                                        {getTypeIcon(resource.type)}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-800">
                                          {resource.title}
                                        </div>
                                        {resource.description && (
                                          <div className="text-sm text-gray-500 mt-1">
                                            {resource.description.length > 40
                                              ? `${resource.description.substring(
                                                  0,
                                                  40
                                                )}...`
                                              : resource.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    {getTypeBadge(resource.type)}
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <LayersIcon size={14} />
                                      <div className="text-sm">
                                        {module.titre}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <ClockIcon size={14} />
                                      <span className="text-sm">
                                        {formatDuration(resource.duration)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2">
                                      {resource.isCompleted ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-sm font-medium">
                                            Terminé
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-orange-600">
                                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                          <span className="text-sm">
                                            En cours
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center justify-center space-x-2">
                                      <button
                                        onClick={() => handleEdit(resource)}
                                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                                        title="Modifier"
                                      >
                                        <Edit3Icon size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setShowDeleteConfirm(resource.id)
                                        }
                                        disabled={isDeleting === resource.id}
                                        className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                                        title="Supprimer"
                                      >
                                        {isDeleting === resource.id ? (
                                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                        ) : (
                                          <Trash2Icon size={16} />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}

                              {moduleQuizzes.map((quiz) => (
                                <tr
                                  key={quiz.id}
                                  className="hover:bg-purple-50/30 transition-all duration-300 group bg-gray-50/30"
                                >
                                  <td className="py-3 px-6 pl-16">
                                    <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300"></div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white">
                                        <HelpCircleIcon size={16} />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-800">
                                          {quiz.title}
                                        </div>
                                        {quiz.description && (
                                          <div className="text-sm text-gray-500 mt-1">
                                            {quiz.description.length > 40
                                              ? `${quiz.description.substring(
                                                  0,
                                                  40
                                                )}...`
                                              : quiz.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                                      QUIZ
                                    </span>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <LayersIcon size={14} />
                                      <div className="text-sm">
                                        {module.titre}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <HelpCircleIcon size={14} />
                                      <span className="text-sm">
                                        {quiz.questions?.length || 0} question
                                        {(quiz.questions?.length || 0) > 1
                                          ? "s"
                                          : ""}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-2 text-purple-600">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span className="text-sm">
                                          Disponible
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-6">
                                    <div className="flex items-center justify-center space-x-2">
                                      <button
                                        onClick={() => handleQuizEdit(quiz)}
                                        className="text-purple-600 hover:text-purple-900 p-1.5 rounded-lg hover:bg-purple-50 transition-all"
                                        title="Modifier le quiz"
                                      >
                                        <Edit3Icon size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleQuizStart(quiz)}
                                        className="text-green-600 hover:text-green-900 p-1.5 rounded-lg hover:bg-green-50 transition-all"
                                        title="Démarrer le quiz"
                                      >
                                        <PlayIcon size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCapIcon className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucune formation trouvée
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Aucun résultat pour votre recherche"
                  : "Commencez par ajouter une nouvelle formation"}
              </p>
            </div>
          )}
        </div>
      </div>

      <EvaluationTestsDrawer
        isOpen={evaluationTestsDrawerOpen}
        onClose={() => setEvaluationTestsDrawerOpen(false)}
        evaluationTests={evaluationTests}
        formations={formations}
        onUpdateTest={updateEvaluationTest}
        onDeleteTest={deleteEvaluationTest}
        onCreateTest={createEvaluationTest}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2Icon className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Confirmer la suppression
                </h3>
                <p className="text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer cette ressource ? Toutes ses
              données seront perdues définitivement.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting === showDeleteConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting === showDeleteConfirm
                  ? "Suppression..."
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isQuizDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {isEditingQuiz
                  ? "Modifier le Quiz"
                  : isPlayingQuiz
                  ? "Quiz en cours"
                  : "Quiz"}
              </h2>
              <button
                onClick={closeQuizDrawer}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isEditingQuiz && editingQuizData ? (
                // Edit Mode
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Questions</h3>
                      <button
                        onClick={addQuestion}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Ajouter une question
                      </button>
                    </div>

                    {editingQuizData.questions?.map(
                      (question, questionIndex) => (
                        <div
                          key={question.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <label className="block text-sm font-medium">
                              Question {questionIndex + 1}
                            </label>
                            <button
                              onClick={() => removeQuestion(questionIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2Icon size={16} />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(
                                questionIndex,
                                "question",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                            placeholder="Tapez votre question..."
                          />

                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Options de réponse
                            </label>
                            {question.options?.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  name={`correct-${questionIndex}`}
                                  checked={
                                    question.correctAnswer === optionIndex
                                  }
                                  onChange={() =>
                                    updateQuestion(
                                      questionIndex,
                                      "correctAnswer",
                                      optionIndex
                                    )
                                  }
                                  className="text-green-600"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateQuestionOption(
                                      questionIndex,
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={closeQuizDrawer}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleQuizSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              ) : isPlayingQuiz && selectedQuiz ? (
                // Play Mode
                <div className="space-y-6">
                  {quizResults ? (
                    // Results
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-4">
                        {quizResults.score === quizResults.total
                          ? "🎉"
                          : quizResults.score >= quizResults.total * 0.7
                          ? "👏"
                          : "📚"}
                      </div>
                      <h3 className="text-2xl font-bold">Quiz terminé!</h3>
                      <div className="text-lg">
                        Votre score:{" "}
                        <span className="font-bold text-blue-600">
                          {quizResults.score}/{quizResults.total}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        {quizResults.score === quizResults.total
                          ? "Parfait! Vous maîtrisez le sujet!"
                          : quizResults.score >= quizResults.total * 0.7
                          ? "Bien joué! Bon travail!"
                          : "Continuez à apprendre, vous y arriverez!"}
                      </div>
                      <button
                        onClick={closeQuizDrawer}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                      >
                        Fermer
                      </button>
                    </div>
                  ) : (
                    // Question
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Question {currentQuestionIndex + 1} sur{" "}
                          {selectedQuiz.questions?.length || 0}
                        </div>
                        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 ml-4">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                ((currentQuestionIndex + 1) /
                                  (selectedQuiz.questions?.length || 1)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-6">
                          {
                            selectedQuiz.questions?.[currentQuestionIndex]
                              ?.question
                          }
                        </h3>

                        <div className="space-y-3">
                          {selectedQuiz.questions?.[
                            currentQuestionIndex
                          ]?.options?.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleAnswerSelect(index)}
                              className={`w-full p-4 text-left border rounded-lg transition-all ${
                                userAnswers[currentQuestionIndex] === index
                                  ? "border-blue-500 bg-blue-50 text-blue-900"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                              }`}
                            >
                              <span className="font-medium mr-3">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <button
                          onClick={handlePrevQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Précédent
                        </button>
                        <button
                          onClick={handleNextQuestion}
                          disabled={
                            userAnswers[currentQuestionIndex] === undefined
                          }
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {currentQuestionIndex ===
                          (selectedQuiz.questions?.length || 0) - 1
                            ? "Terminer"
                            : "Suivant"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isEditMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Modifier Ressource</h2>
                <p className="text-blue-100 mt-1">
                  Mettre à jour les informations
                </p>
              </div>
              <button
                onClick={() => setIsEditMenuOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XIcon size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {selectedResource && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {getTypeIcon(selectedResource.type)}
                  </div>
                  <p className="text-gray-500 text-sm">
                    ID: {selectedResource.id}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Titre de la ressource
                    </label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nom de la ressource"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type de ressource
                    </label>
                    <select
                      value={editData.type}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="video">Vidéo</option>
                      <option value="pdf">PDF</option>
                      <option value="text">Texte</option>
                      <option value="link">Lien</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Module
                    </label>
                    <select
                      value={editData.moduleId}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          moduleId: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un module</option>
                      {modules.map((module) => {
                        const formation = formations.find(
                          (f) => f.id === module.formationId
                        );
                        return (
                          <option key={module.id} value={module.id}>
                            {module.titre} -{" "}
                            {formation?.titre || "Formation inconnue"}
                          </option>
                        );
                      })}
                    </select>
                    {currentModule && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>Module actuel:</strong> {currentModule.titre}
                        </div>
                        {currentFormation && (
                          <div className="text-xs text-blue-600 mt-1">
                            Formation: {currentFormation.titre}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Description de la ressource"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Durée (minutes)
                      </label>
                      <input
                        type="number"
                        value={editData.duration}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            duration: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isCompleted"
                      checked={editData.isCompleted}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          isCompleted: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isCompleted"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ressource terminée
                    </label>
                  </div>

                  {editData.type === "video" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien vidéo
                      </label>
                      <input
                        type="url"
                        value={editData.videoLink}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            videoLink: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {editData.type === "pdf" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien PDF
                      </label>
                      <input
                        type="url"
                        value={editData.pdfLink}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            pdfLink: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {editData.type === "link" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien externe
                      </label>
                      <input
                        type="url"
                        value={editData.textLink}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            textLink: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {editData.type === "text" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contenu texte
                      </label>
                      <textarea
                        value={editData.content}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Contenu de la ressource..."
                        rows={5}
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <CheckIcon size={18} />
                          Mettre à jour
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMenuOpen(false);
                        setSelectedResource(null);
                      }}
                      disabled={isUpdating}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesInterface;

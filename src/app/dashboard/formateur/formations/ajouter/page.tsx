"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  ArrowRight,
  BookOpen,
  Settings,
  Eye,
  Type,
  Trash2Icon,
  PlusIcon,
  ArrowLeftIcon,
  HelpCircleIcon,
  XIcon,
  FileTextIcon,
  CheckCircleIcon,
  Link2Icon,
  MailIcon,
  CheckIcon,
  ClipboardList,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import DynamicResourceTable from "@/components/DynamicResourceTable";

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface ModuleData {
  id?: string;
  titre: string;
  description?: string;
  duration?: number;
  order?: number;
  resources?: {
    id?: string;
    title: string;
    type: "document" | "video" | "link" | "image" | "table";
    url?: string;
    content?: string;
    tableData?: {
      headers: string[];
      data: string[][];
    };
    fileName?: string;
    fileSize?: number;
    previewUrl?: string;
    file?: File | null;
    isSaved?: boolean;
  }[];
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
  order: number;
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

interface FormData {
  titre: string;
  domaine: string;
  image?: string;
  description: string;
  objectifs: string;
  startDate: Date | null;
  endDate: Date | null;
  accessType: string;
  userId: string;
  modules: ModuleData[];
  evaluationTest?: EvaluationTest;
}

interface FormationCreatorProps {
  mode?: "create" | "edit";
  formationIdEdit?: string;
  initialStartDate: Date | null;
  initialEndDate: Date | null;
  onDateChange?: (startDate: Date | null, endDate: Date | null) => void;
  disabled?: boolean;
}

const StepWrapper = ({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 min-h-[500px]">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const FormationCreator = ({
  mode = "create",
  formationIdEdit,
  initialStartDate = null,
  initialEndDate = null,
  onDateChange = () => {},
  disabled = false,
}: FormationCreatorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formateurs, setFormateurs] = useState<User[]>([]);
  const { user } = useAuth();
  const [formationId, setFormationId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [currentFormationId, setCurrentFormationId] = useState<string>(
    mode === "edit" ? formationIdEdit || "" : ""
  );
  const [formData, setFormData] = useState<FormData>({
    titre: "",
    domaine: "",
    image: "",
    description: "",
    objectifs: "",
    accessType: "public",
    startDate: null,
    endDate: null,
    userId: user?.role === "formateur" ? user.id : "",
    modules: [],
    evaluationTest: {
      isEnabled: false,
      title: "",
      timeLimit: 60,
      passingScore: 70,
      description: "",
      questions: [],
    },
  });

  const [invitationData, setInvitationData] = useState({
    mode: "email",
    emails: [""],
    invitationLink: "",
    linkGenerated: false,
    csvFile: null as File | null,
    expiresAt: 0,
  });

  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: "multiple-choice",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "0",
    points: 1,
    explanation: "",
  });

  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState({
    titre: "",
    description: "",
    duration: 0,
    order: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [savingResource, setSavingResource] = useState<string | null>(null);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [isSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const API_BASE_URL = "http://127.0.0.1:3001";

  const steps = [
    {
      number: 1,
      title: "General Info",
      icon: BookOpen,
      description: "Basic details",
    },
    {
      number: 2,
      title: "Content",
      icon: Type,
      description: "Modules & resources",
    },
    {
      number: 3,
      title: "Evaluation Test",
      icon: ClipboardList,
      description: "Assessment & quiz",
    },
    {
      number: 4,
      title: "Settings",
      icon: Settings,
      description: "Access & invitations",
    },
    { number: 5, title: "Preview", icon: Eye, description: "Review & publish" },
  ];

  const HorizontalTimeline = () => (
    <div className="w-full mb-12">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div
              className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
                currentStep >= step.number ? "text-blue-600" : "text-gray-400"
              }`}
              onClick={() => setCurrentStep(step.number)}
            >
              <div
                className={`
                w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 mb-3
                ${
                  currentStep > step.number
                    ? "bg-blue-600 border-blue-600 text-white"
                    : currentStep === step.number
                    ? "bg-white border-blue-600 text-blue-600 shadow-lg scale-110"
                    : "bg-white border-gray-300 text-gray-400"
                }
              `}
              >
                {currentStep > step.number ? (
                  <Check size={24} />
                ) : (
                  <step.icon size={24} />
                )}
              </div>

              <div className="text-center">
                <h3
                  className={`font-semibold text-sm ${
                    currentStep >= step.number
                      ? "text-gray-800"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>

              {currentStep === step.number && (
                <div className="absolute -bottom-4 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              )}
            </div>

            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-8 transition-all duration-500 ${
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white";
  const buttonClass =
    "px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2";

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchFormationData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch formation details
      const formationResponse = await fetch(`/api/formations/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!formationResponse.ok) {
        throw new Error("Failed to fetch formation data");
      }

      const formationResult = await formationResponse.json();
      const formationData = formationResult.success
        ? formationResult.data
        : formationResult;

      // Fetch all modules and filter by formationId on frontend
      const modulesResponse = await fetch(`/api/modules`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let allModules = [];
      if (modulesResponse.ok) {
        const modulesResult = await modulesResponse.json();
        allModules = modulesResult.success ? modulesResult.data : modulesResult;
      }

      // Filter modules by formationId
      const modulesData = allModules.filter(
        (module: any) => module.formationId === id
      );

      let evaluationTest: EvaluationTest = {
        isEnabled: false,
        title: "",
        timeLimit: 60,
        passingScore: 70,
        description: "",
        questions: [],
      };

      if (formationData.evaluationTest) {
        evaluationTest = {
          ...evaluationTest,
          ...formationData.evaluationTest,
          questions: formationData.evaluationTest.questions || [],
        };
      }

      // Fetch all resources and quizzes once
      const [resourcesResponse, quizzesResponse] = await Promise.all([
        fetch(`http://127.0.0.1:3001/resources/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch(`http://127.0.0.1:3001/quizzes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      let allResources = [];
      let allQuizzes = [];

      if (resourcesResponse.ok) {
        const resourcesResult = await resourcesResponse.json();
        allResources = resourcesResult.success
          ? resourcesResult.data
          : resourcesResult;
      }

      if (quizzesResponse.ok) {
        const quizzesResult = await quizzesResponse.json();
        allQuizzes = quizzesResult.success ? quizzesResult.data : quizzesResult;
      }

      const modulesWithDetails = modulesData.map((module: any) => {
        try {
          const resources = allResources.filter(
            (resource: any) => resource.moduleId === module.id
          );

          const moduleQuizzes = allQuizzes.filter(
            (quiz: any) => quiz.moduleId === module.id
          );

          const questions = moduleQuizzes.reduce(
            (allQuestions: any[], quiz: any) => {
              if (quiz.questions && Array.isArray(quiz.questions)) {
                const quizQuestions = quiz.questions.map((question: any) => ({
                  id: question.id,
                  question: question.question || "",
                  options: Array.isArray(question.options)
                    ? question.options
                    : ["", "", "", ""],
                  correctAnswer: question.correctAnswer || 0,
                  quizId: quiz.id,
                  moduleId: module.id,
                  order: question.order || 0,
                }));
                return [...allQuestions, ...quizQuestions];
              }
              return allQuestions;
            },
            []
          );

          questions.sort((a: any, b: any) => a.order - b.order);

          console.log(`Questions for module ${module.id}:`, questions);

          return {
            ...module,
            resources: resources.map((resource: any) => ({
              ...resource,
              isSaved: true,
            })),
            questions: questions,
          };
        } catch (error) {
          console.error(
            `Error processing details for module ${module.id}:`,
            error
          );
          return {
            ...module,
            resources: [],
            questions: [],
          };
        }
      });

      console.log("Modules with details:", modulesWithDetails);

      const invitationsResponse = await fetch(
        `http://127.0.0.1:3001/invitations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let invitationInfo = {
        mode: "email",
        emails: [""],
        invitationLink: "",
        linkGenerated: false,
        csvFile: null as File | null,
        expiresAt: 0,
      };

      if (invitationsResponse.ok) {
        const invitationsResult = await invitationsResponse.json();
        const allInvitations = invitationsResult.success
          ? invitationsResult.data
          : invitationsResult;

        const invitations = allInvitations.filter(
          (invitation: any) => invitation.formationId === id
        );

        if (invitations && invitations.length > 0) {
          const invitation = invitations[0];
          invitationInfo = {
            mode: invitation.mode || "email",
            emails: invitation.emails || [""],
            invitationLink: invitation.invitationLink || "",
            linkGenerated: !!invitation.invitationLink,
            expiresAt: invitation.expiresAt || 0,
            csvFile: null,
          };
        }
      }

      let validStartDate = null;
      let validEndDate = null;

      if (formationData.startDate) {
        const parsedStartDate = new Date(formationData.startDate);
        if (!isNaN(parsedStartDate.getTime())) {
          validStartDate = parsedStartDate;
        }
      }

      if (formationData.endDate) {
        const parsedEndDate = new Date(formationData.endDate);
        if (!isNaN(parsedEndDate.getTime())) {
          validEndDate = parsedEndDate;
        }
      }

      setStartDate(validStartDate);
      setEndDate(validEndDate);
      setFormData({
        titre: formationData.titre || "",
        domaine: formationData.domaine || "",
        image: formationData.image || "",
        description: formationData.description || "",
        objectifs: formationData.objectifs || "",
        accessType: formationData.accessType || "public",
        startDate: validStartDate,
        endDate: validEndDate,
        userId: formationData.userId || "",
        modules: modulesWithDetails,
        evaluationTest: evaluationTest,
      });

      console.log("formationData.startDate", formationData.startDate);

      setInvitationData(invitationInfo);
      setCurrentFormationId(id);
      setStartDate(validStartDate);
      setEndDate(validEndDate);
    } catch (error) {
      console.error("Error fetching formation data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load formation data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "edit" && formationIdEdit) {
      fetchFormationData(formationIdEdit);
    }
  }, [mode, formationIdEdit]);

  useEffect(() => {
    if (startDate && endDate) {
      onDateChange(startDate, endDate);
    }
  }, [startDate, endDate, onDateChange]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      startDate: startDate,
      endDate: endDate,
    }));
  }, [startDate, endDate]);

  useEffect(() => {
    if (user?.role === "formateur" && user?.id) {
      setFormData((prev) => ({
        ...prev,
        userId: user.id,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3001/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch formateurs");
        }

        const data = await response.json();
        setFormateurs(data);
        console.log("Fetched formateurs:", data);
      } catch (error) {
        console.error("Error fetching formateurs:", error);
      }
    };

    fetchFormateurs();
  }, []);

  useEffect(() => {
    if (formData.evaluationTest?.isEnabled && formationId) {
      if (!formData.evaluationTest.questions) {
        setFormData((prev) => ({
          ...prev,
          evaluationTest: {
            ...prev.evaluationTest!,
            questions: [],
          },
        }));
      }
      loadQuestions();
    }
  }, [formData.evaluationTest?.isEnabled, formationId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/questions/formation/${formationId}?includeAnswers=true`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.statusText}`);
      }

      const questions = await response.json();

      setFormData((prev) => ({
        ...prev,
        evaluationTest: {
          ...prev.evaluationTest!,
          questions: Array.isArray(questions) ? questions : [],
        },
      }));
    } catch (err) {
      console.error("Error loading questions:", err);
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const fileName = `${Date.now()}_${file.name}`;
      setFormData((prev) => ({ ...prev, image: fileName }));
    } else {
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const result = await response.json();
    return result.filename;
  };

  const updateFormation = async (formData: FormData) => {
    try {
      const finalFormData = { ...formData };

      if (imageFile) {
        const filename = await uploadImage(imageFile);
        finalFormData.image = filename;
      }

      const response = await fetch(`/api/formations/${currentFormationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update formation");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred");
    }
  };

  const handleContinue = async () => {
    setError(null);
    setLoading(true);

    try {
      console.log("Form data before validation:", formData);

      if (!formData.userId) {
        throw new Error("Please select a formateur");
      }

      if (user?.role !== "formateur") {
        const selectedUser = formateurs.find((f) => f.id === formData.userId);
        if (!selectedUser) {
          throw new Error(
            "Selected formateur is not valid. Please select a different formateur."
          );
        }
        if (selectedUser.role !== "formateur") {
          throw new Error(
            "Selected user is not a formateur. Please select a valid formateur."
          );
        }
      }

      let formationIdToUse;
      if (mode === "create") {
        formationIdToUse = await createFormation(formData);
        console.log("Formation created with ID:", formationIdToUse);
        setFormationId(formationIdToUse);
        setCurrentFormationId(formationIdToUse);
      } else {
        await updateFormation(formData);
        formationIdToUse = currentFormationId;
        console.log("Formation updated with ID:", formationIdToUse);
      }
      setCurrentStep(2);
    } catch (error) {
      console.error(`Error in ${mode} formation:`, error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const addModule = async () => {
    if (!currentFormationId) {
      setError("Formation ID is required to add modules");
      return;
    }

    if (!currentModule.titre.trim()) {
      setError("Module title is required");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const currentModules = formData.modules || [];

      const newModuleData = {
        titre: currentModule.titre,
        formationId: currentFormationId,
        order: currentModule.order,
        description: currentModule.description,
        duration: currentModule.duration,
      };

      // Create module in backend
      const createdModule = await createModule(newModuleData);

      // Add to local state with the created module data
      setFormData((prev) => ({
        ...prev,
        modules: [
          ...(prev.modules || []),
          {
            id: createdModule.id,
            titre: createdModule.titre,
            order: createdModule.order,
            description: createdModule.description || "",
            duration: createdModule.duration || 0,
            resources: [],
            questions: [],
          },
        ],
      }));

      // Reset current module form
      setCurrentModule({
        titre: "",
        description: "",
        duration: 0,
        order: currentModules.length + 1,
      });
    } catch (error) {
      console.error("Error adding module:", error);
      setError(error instanceof Error ? error.message : "Failed to add module");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (mode === "edit") {
      // Show success message for edit
      alert("Formation updated successfully!");
    }
    router.push("/dashboard/formateur/formations/");
  };

  const createFormation = async (formData: FormData) => {
    try {
      const finalFormData = { ...formData };

      // Upload image if one is selected
      if (imageFile) {
        const filename = await uploadImage(imageFile);
        finalFormData.image = filename;
      }

      const response = await fetch("/api/formations/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create formation");
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred");
    }
  };

  const removeModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const createOrUpdateEvaluationTest = async (targetFormationId: string) => {
    try {
      const evaluationTestData = {
        isEnabled: formData.evaluationTest?.isEnabled || false,
        title: formData.evaluationTest?.title || "",
        timeLimit: formData.evaluationTest?.timeLimit || 60,
        passingScore: formData.evaluationTest?.passingScore || 70,
        description: formData.evaluationTest?.description || "",
        formationId: targetFormationId,
      };

      const existingTestId = formData.evaluationTest?.id;

      if (existingTestId) {
        const response = await fetch(
          `${API_BASE_URL}/evaluation-tests/${existingTestId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(evaluationTestData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to update evaluation test: ${response.statusText}`
          );
        }

        return await response.json();
      } else {
        const response = await fetch(`${API_BASE_URL}/evaluation-tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(evaluationTestData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to create evaluation test: ${response.statusText}`
          );
        }

        return await response.json();
      }
    } catch (error) {
      console.error("Error with evaluation test:", error);
      throw error;
    }
  };

  const createQuestion = async () => {
    if (!currentQuestion.question?.trim()) {
      setError("Question text is required");
      return;
    }

    if (currentQuestion.type === "multiple-choice") {
      const validOptions =
        currentQuestion.options?.filter((opt) => opt.trim()) || [];
      if (validOptions.length < 2) {
        setError("Multiple choice questions need at least 2 options");
        return;
      }
      if (!currentQuestion.correctAnswer) {
        setError("Please select the correct answer");
        return;
      }
    }

    if (currentQuestion.type === "true-false") {
      if (!currentQuestion.correctAnswer) {
        setError("Please select True or False");
        return;
      }
    }

    if (currentQuestion.type === "short-answer") {
      if (!currentQuestion.correctAnswer?.trim()) {
        setError("Sample answer is required for short answer questions");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const targetFormationId =
        mode === "edit" ? formationIdEdit || currentFormationId : formationId;

      if (!targetFormationId) {
        throw new Error("Formation ID is required to create questions");
      }

      const promises = [];

      let evaluationTestPromise;
      if (
        !formData.evaluationTest?.id ||
        (formData.evaluationTest?.questions || []).length === 0
      ) {
        evaluationTestPromise = createOrUpdateEvaluationTest(targetFormationId);
        promises.push(evaluationTestPromise);
      }

      let evaluationTest: EvaluationTest | undefined;
      if (evaluationTestPromise) {
        evaluationTest = await evaluationTestPromise;

        setFormData((prev) => ({
          ...prev,
          evaluationTest: {
            ...prev.evaluationTest!,
            id: evaluationTest?.id,
          },
        }));
      } else {
        evaluationTest = formData.evaluationTest;
      }

      const questionData = {
        type: currentQuestion.type!,
        question: currentQuestion.question!,
        options:
          currentQuestion.type === "multiple-choice"
            ? currentQuestion.options?.filter((opt) => opt.trim())
            : undefined,
        correctAnswer: currentQuestion.correctAnswer!,
        points: currentQuestion.points || 1,
        explanation: currentQuestion.explanation || undefined,
        evaluationTestId: evaluationTest?.id,
        order: (formData.evaluationTest?.questions.length || 0) + 1,
        formationId: targetFormationId,
      };

      const questionResponse = await fetch(`${API_BASE_URL}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!questionResponse.ok) {
        const errorData = await questionResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to create question: ${questionResponse.statusText}`
        );
      }

      const createdQuestion = await questionResponse.json();

      // Update local state with the new question
      setFormData((prev) => ({
        ...prev,
        evaluationTest: {
          ...prev.evaluationTest!,
          id: evaluationTest?.id || prev.evaluationTest?.id,
          questions: [
            ...(prev.evaluationTest?.questions || []),
            createdQuestion,
          ],
        },
      }));

      // Reset current question form
      setCurrentQuestion({
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "0",
        points: 1,
        explanation: "",
      });
    } catch (err) {
      console.error("Error creating question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create question"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (
    questionId: string,
    questionData: Partial<Question>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const targetFormationId =
        mode === "edit" ? formationIdEdit || currentFormationId : formationId;

      if (!targetFormationId) {
        throw new Error("Formation ID is required");
      }

      // Prepare promises for parallel execution
      const promises = [];

      // 1. Update evaluation test settings if needed
      const evaluationTestPromise =
        createOrUpdateEvaluationTest(targetFormationId);
      promises.push(evaluationTestPromise);

      // 2. Update question
      const questionPromise = fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });
      promises.push(questionPromise);

      // Execute both operations in parallel
      const [evaluationTest, questionResponse] = await Promise.all(promises);

      if (!questionResponse.ok) {
        const errorData = await questionResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update question: ${questionResponse.statusText}`
        );
      }

      const updatedQuestion = await questionResponse.json();

      // Update the question in local state
      setFormData((prev) => ({
        ...prev,
        evaluationTest: {
          ...prev.evaluationTest!,
          id: evaluationTest.id,
          questions: (prev.evaluationTest?.questions || []).map((q) =>
            q.id === questionId ? updatedQuestion : q
          ),
        },
      }));

      setEditingQuestion(null);
    } catch (err) {
      console.error("Error updating question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update question"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete question: ${response.statusText}`);
      }

      setFormData((prev) => ({
        ...prev,
        evaluationTest: {
          ...prev.evaluationTest!,
          questions: (prev.evaluationTest?.questions || []).filter(
            (q) => q.id !== questionId
          ),
        },
      }));
    } catch (err) {
      console.error("Error deleting question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete question"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateEvaluationSettings = (updates: Partial<EvaluationTest>) => {
    setFormData((prev) => ({
      ...prev,
      evaluationTest: {
        ...prev.evaluationTest!,
        ...updates,
        // Ensure questions array is preserved
        questions: updates.questions || prev.evaluationTest?.questions || [],
      },
    }));
  };

  const EditableQuestion = ({
    question,
    onSave,
    onCancel,
  }: {
    question: Question;
    onSave: (data: Partial<Question>) => void;
    onCancel: () => void;
  }) => {
    const [editData, setEditData] = useState<Partial<Question>>({
      ...question,
      options: question.options || ["", "", "", ""],
    });

    return (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Question Type
            </label>
            <select
              value={editData.type}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  type: e.target.value as Question["type"],
                }))
              }
              className="w-full p-2 border rounded"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <textarea
              value={editData.question || ""}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, question: e.target.value }))
              }
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>

          {editData.type === "multiple-choice" && (
            <div>
              <label className="block text-sm font-medium mb-2">Options</label>
              {(editData.options || ["", "", "", ""]).map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="radio"
                    name="editCorrectAnswer"
                    checked={editData.correctAnswer === index.toString()}
                    onChange={() =>
                      setEditData((prev) => ({
                        ...prev,
                        correctAnswer: index.toString(),
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [
                        ...(editData.options || ["", "", "", ""]),
                      ];
                      newOptions[index] = e.target.value;
                      setEditData((prev) => ({ ...prev, options: newOptions }));
                    }}
                    className="flex-1 p-2 border rounded"
                  />
                </div>
              ))}
            </div>
          )}

          {editData.type === "true-false" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Correct Answer
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={editData.correctAnswer === "true"}
                    onChange={() =>
                      setEditData((prev) => ({
                        ...prev,
                        correctAnswer: "true",
                      }))
                    }
                    className="mr-2"
                  />
                  True
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={editData.correctAnswer === "false"}
                    onChange={() =>
                      setEditData((prev) => ({
                        ...prev,
                        correctAnswer: "false",
                      }))
                    }
                    className="mr-2"
                  />
                  False
                </label>
              </div>
            </div>
          )}

          {editData.type === "short-answer" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Correct Answer
              </label>
              <textarea
                value={editData.correctAnswer || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    correctAnswer: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
                rows={2}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Points</label>
            <input
              type="number"
              value={editData.points || 1}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  points: parseInt(e.target.value) || 1,
                }))
              }
              min="1"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Explanation
            </label>
            <textarea
              value={editData.explanation || ""}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onSave(editData)}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-300"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const addQuiz = (moduleIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              questions: [
                ...(module.questions || []),
                {
                  question: "",
                  options: ["", "", "", ""],
                  correctAnswer: 0,
                },
              ],
            }
          : module
      ),
    }));
  };

  const removeQuiz = (moduleIndex: number, questionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              questions:
                module.questions?.filter((_, qi) => qi !== questionIndex) || [],
            }
          : module
      ),
    }));
  };

  const updateQuiz = (
    moduleIndex: number,
    questionIndex: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              questions:
                module.questions?.map((question, qi) =>
                  qi === questionIndex
                    ? { ...question, [field]: value }
                    : question
                ) || [],
            }
          : module
      ),
    }));
  };

  const updateQuestionOption = (
    moduleIndex: number,
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              questions:
                module.questions?.map((question, qi) =>
                  qi === questionIndex
                    ? {
                        ...question,
                        options: question.options.map((option, oi) =>
                          oi === optionIndex ? value : option
                        ),
                      }
                    : question
                ) || [],
            }
          : module
      ),
    }));
  };

  const saveQuizQuestions = async (
    moduleId: string,
    questions:
      | { question: string; options: string[]; correctAnswer: number }[]
      | undefined
  ) => {
    try {
      // Use the correct formation ID based on mode
      const formationIdToUse =
        mode === "edit" ? currentFormationId : formationId;

      if (!formationIdToUse) {
        throw new Error("Formation ID is required");
      }

      if (!questions || questions.length === 0) {
        throw new Error("No questions to save");
      }

      const validQuestions = questions.filter(
        (q) =>
          q.question &&
          q.question.trim() &&
          q.options &&
          q.options.length === 4 &&
          q.options.every((opt: string) => opt.trim()) &&
          typeof q.correctAnswer === "number"
      );

      if (validQuestions.length === 0) {
        throw new Error(
          "No valid questions found. Please ensure all questions have text, 4 options, and a correct answer selected."
        );
      }

      const response = await fetch("/api/quiz/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formationId: formationIdToUse, // Use the correct formation ID
          moduleId: moduleId,
          questions: validQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save quiz questions");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while saving quiz questions");
    }
  };
  if (loading && mode === "edit") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading formation data...</p>
        </div>
      </div>
    );
  }

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.titre.trim() &&
          formData.domaine.trim() &&
          formData.description.trim() &&
          formData.objectifs.trim() &&
          formData.accessType &&
          formData.userId.trim() !== "" &&
          !loading
        );
      case 2:
        return (
          formData.modules &&
          formData.modules.length > 0 &&
          formData.modules.every(
            (module) => module.titre && module.titre.trim()
          )
        );
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const createModule = async (moduleData: {
    titre: string;
    formationId: string;
    order?: number;
    description?: string;
    duration?: number;
  }) => {
    try {
      console.log("Creating module with data:", moduleData);

      const response = await fetch("/api/modules/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Module creation error:", errorData);
        throw new Error(
          errorData.message ||
            `Failed to create module: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Module created successfully:", result);
      return result.data || result;
    } catch (error) {
      console.error("Error in createModule:", error);
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while creating module");
    }
  };

  const createResource = async (resourceData: {
    title: string;
    type: string;
    url: string;
    moduleId: string;
  }) => {
    try {
      const response = await fetch("/api/resources/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resourceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create resource");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while creating resource");
    }
  };

  const addResource = (moduleIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((currentModule, i) =>
        i === moduleIndex
          ? {
              ...currentModule,
              resources: [
                ...(currentModule.resources || []),
                { title: "", type: "document", url: "", isSaved: false },
              ],
            }
          : currentModule
      ),
    }));
  };

  const removeResource = (moduleIndex: number, resourceIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((currentModule, i) =>
        i === moduleIndex
          ? {
              ...currentModule,
              resources:
                currentModule.resources?.filter(
                  (_, ri) => ri !== resourceIndex
                ) || [],
            }
          : currentModule
      ),
    }));
  };

  const updateResource = (
    moduleIndex: number,
    resourceIndex: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((currentModule, i) =>
        i === moduleIndex
          ? {
              ...currentModule,
              resources:
                currentModule.resources?.map((resource, ri) =>
                  ri === resourceIndex
                    ? { ...resource, [field]: value, isSaved: false }
                    : resource
                ) || [],
            }
          : currentModule
      ),
    }));
  };

  const saveResource = async (moduleIndex: number, resourceIndex: number) => {
    const currentModule = formData.modules[moduleIndex];
    const resource = currentModule.resources?.[resourceIndex];

    if (!resource || !currentModule.id) {
      setError("Module ID or resource data is missing");
      return;
    }

    if (!resource.title.trim()) {
      setError("Resource title is required");
      return;
    }

    if (resource.type === "table") {
      if (
        !resource.tableData ||
        !resource.tableData.headers ||
        !resource.tableData.data
      ) {
        setError("Table data is required for table resources");
        return;
      }
    } else if (["image", "video", "document"].includes(resource.type)) {
      if (!resource.url && !resource.file) {
        setError("File or URL is required for this resource type");
        return;
      }
    }

    try {
      setSavingResource(`${moduleIndex}-${resourceIndex}`);
      setError(null);

      const resourceData: any = {
        title: resource.title,
        type: resource.type,
        moduleId: currentModule.id,
      };

      if (resource.type === "table") {
        resourceData.tableData = resource.tableData;
      } else {
        resourceData.url = resource.url || "";
        if (resource.previewUrl) {
          resourceData.previewUrl = resource.previewUrl;
        }
        if (resource.file) {
          resourceData.fileName = resource.file.name;
          resourceData.fileSize = resource.file.size;
        }
      }

      if (resource.content) {
        resourceData.content = resource.content;
      }

      const savedResource = await createResource(resourceData);

      setFormData((prev) => ({
        ...prev,
        modules: prev.modules.map((mod, i) =>
          i === moduleIndex
            ? {
                ...mod,
                resources:
                  mod.resources?.map((res, ri) =>
                    ri === resourceIndex
                      ? {
                          ...res,
                          id: savedResource.id,
                          isSaved: true,
                        }
                      : res
                  ) || [],
              }
            : mod
        ),
      }));

      setTimeout(() => {
        setSavingResource(null);
      }, 1000);
    } catch (error) {
      console.error("Error saving resource:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save resource"
      );
    } finally {
      setSavingResource(null);
    }
  };

  const addEmail = () => {
    setInvitationData((prev) => ({
      ...prev,
      emails: [...prev.emails, ""],
    }));
  };

  const removeEmail = (index: number) => {
    setInvitationData((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index),
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setInvitationData((prev) => ({
      ...prev,
      emails: prev.emails.map((email, i) => (i === index ? value : email)),
    }));
  };

  const sendEmailInvitations = async () => {
    let finalLink = invitationData.invitationLink;
    if (!finalLink) {
      const expirationTime = Date.now() + 2 * 24 * 60 * 60 * 1000;
      const linkId = Math.random().toString(36).substring(2, 15);
      finalLink = `${window.location.origin}/join-formation?token=${linkId}&expires=${expirationTime}`;

      setInvitationData((prev) => ({
        ...prev,
        invitationLink: finalLink,
        linkGenerated: true,
        expiresAt: expirationTime,
      }));
    }

    const validEmails = invitationData.emails.filter(
      (email) => email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (validEmails.length === 0) {
      alert("Please add at least one valid email address.");
      return;
    }

    setIsCreatingInvitation(true);
    const results = [];

    for (const email of validEmails) {
      try {
        const response = await fetch("/api/send-invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail: email,
            formationName: formData?.titre || "Formation",
            invitationLink: finalLink,
            expiresAt: invitationData.expiresAt,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Request failed");
        }

        const result = await response.json();
        results.push({ email, ...result });
      } catch (error) {
        results.push({
          email,
          success: false,
          error: error.message || "Network request failed",
        });
      }
    }
    setIsCreatingInvitation(false);

    // Handle results
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    if (successCount > 0 && failureCount === 0) {
      alert(`Successfully sent ${successCount} invitation(s)!`);
    } else if (successCount > 0 && failureCount > 0) {
      alert(
        `Sent ${successCount} invitation(s) successfully, ${failureCount} failed.`
      );
      console.log(
        "Failed emails:",
        results.filter((r) => !r.success)
      );
    } else {
      alert(
        "Failed to send all invitations. Please check your email configuration."
      );
    }

    console.log("Email sending results:", results);
  };

  const generateLink = () => {
    const linkId = Math.random().toString(36).substring(2, 15);
    const expirationTime = Date.now() + 2 * 24 * 60 * 60 * 1000;
    const generatedLink = `http://localhost:3000/invit-formation/${linkId}?expires=${expirationTime}`;

    setInvitationData((prev) => ({
      ...prev,
      invitationLink: generatedLink,
      linkGenerated: true,
      expiresAt: expirationTime,
    }));
  };

  const createInvitation = async () => {
    const formationIdToUse = mode === "edit" ? currentFormationId : formationId;

    if (!formationIdToUse) {
      console.error("Formation ID is required");
      return false;
    }

    if (formData.accessType !== "private") {
      return true;
    }

    try {
      setIsCreatingInvitation(true);

      const invitationPayload: any = {
        mode: invitationData.mode,
        formationId: formationIdToUse, // Use the correct formation ID
        isActive: true,
      };

      switch (invitationData.mode) {
        case "email":
          const validEmails = invitationData.emails.filter(
            (email) => email.trim() !== ""
          );
          if (validEmails.length === 0) {
            throw new Error("At least one email is required");
          }
          invitationPayload.emails = validEmails;
          break;

        case "link":
          if (!invitationData.linkGenerated) {
            const expirationTime = Date.now() + 2 * 24 * 60 * 60 * 1000;
            invitationPayload.invitationLink = `http://localhost:3000/dashboard/participant/formations/${formationIdToUse}?expires=${expirationTime}`;
            invitationPayload.linkGenerated = true;
            invitationPayload.expiresAt = expirationTime;
          } else {
            invitationPayload.invitationLink = invitationData.invitationLink;
            invitationPayload.linkGenerated = true;
            invitationPayload.expiresAt = invitationData.expiresAt;
          }
          break;

        case "csv":
          if (!invitationData.csvFile) {
            throw new Error("CSV file is required");
          }
          invitationPayload.csvFile = invitationData.csvFile.name;
          break;

        default:
          throw new Error("Invalid invitation mode");
      }

      const response = await fetch("/api/invitations/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invitationPayload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create invitation");
      }

      console.log("Invitation created successfully:", result.data);
      sendEmailInvitations();
      return true;
    } catch (error) {
      console.error("Error creating invitation:", error);
      alert(`Error creating invitation: ${error.message}`);
      return false;
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  const isLinkExpired = (expiresAt: number) => {
    return Date.now() > expiresAt;
  };

  const formatExpirationDate = (expiresAt: number) => {
    return new Date(expiresAt).toLocaleString();
  };

  const handleNextStep = async () => {
    setIsCreatingInvitation(true);

    try {
      const formationUpdateData = {
        accessType: formData.accessType,
      };

      const formationResponse = await fetch(
        `/api/formations/${currentFormationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formationUpdateData),
        }
      );

      if (!formationResponse.ok) {
        throw new Error("Failed to update formation access type");
      }

      if (formData.accessType === "private") {
        const invitationSuccess = await createInvitation();
        if (!invitationSuccess) {
          return;
        }
      }

      setCurrentStep(5);
    } catch (error) {
      console.error("Error updating formation:", error);
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  const getCurrentImageUrl = () => {
    if (formData.image && mode === "edit") {
      return `/uploads/${formData.image}`;
    }
    return undefined;
  };

  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("fr-FR");
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate || !date) return false;
    return date > startDate && date < endDate;
  };

  const isDateSelected = (date: Date) => {
    if (!date) return false;
    return (
      (startDate && date.toDateString() === startDate.toDateString()) ||
      (endDate && date.toDateString() === endDate.toDateString())
    );
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(new Date(date));
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setEndDate(new Date(startDate));
        setStartDate(new Date(date));
      } else {
        setEndDate(new Date(date));
      }
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingStart(true);
  };

  const confirmDates = () => {
    if (startDate && endDate) {
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return "Sélectionner les dates *";
  };

  const today = new Date();
  const days = getDaysInMonth(currentMonth);

  if (loading && mode === "edit") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading formation data...</p>
        </div>
      </div>
    );
  }

  const pageTitle = mode === "edit" ? "Edit Formation" : "Create New Formation";
  const submitButtonText =
    mode === "edit" ? "Update Formation" : "Publish Formation";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{pageTitle}</h1>
          <p className="text-gray-600 text-lg">
            {mode === "edit"
              ? "Update your formation details, modules, and settings"
              : "Build engaging learning experiences step by step"}
          </p>
        </div>

        <HorizontalTimeline />

        {currentStep === 1 && (
          <StepWrapper
            title="Formation Details"
            subtitle="Tell us about your course"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Formation Title *
                  </label>
                  <input
                    name="titre"
                    placeholder="Enter formation title"
                    value={formData.titre}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Domain *
                  </label>
                  <select
                    name="domaine"
                    value={formData.domaine}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select an IT domain</option>
                    <option value="web-development">Web Development</option>
                    <option value="mobile-development">
                      Mobile Development
                    </option>
                    <option value="software-engineering">
                      Software Engineering
                    </option>
                    <option value="data-science">Data Science</option>
                    <option value="artificial-intelligence">
                      Artificial Intelligence
                    </option>
                    <option value="machine-learning">Machine Learning</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="cloud-computing">Cloud Computing</option>
                    <option value="devops">DevOps</option>
                    <option value="database-administration">
                      Database Administration
                    </option>
                    <option value="network-administration">
                      Network Administration
                    </option>
                    <option value="system-administration">
                      System Administration
                    </option>
                    <option value="ui-ux-design">UI/UX Design</option>
                    <option value="game-development">Game Development</option>
                    <option value="blockchain">Blockchain</option>
                    <option value="iot">Internet of Things (IoT)</option>
                    <option value="quality-assurance">Quality Assurance</option>
                    <option value="business-analysis">Business Analysis</option>
                    <option value="project-management">
                      IT Project Management
                    </option>
                    <option value="technical-writing">Technical Writing</option>
                  </select>
                </div>
              </div>

              <div>
                <ImageUpload
                  label="Cover Image"
                  currentImage={getCurrentImageUrl()}
                  onImageChange={handleImageChange}
                  className="mb-4"
                />
              </div>

              <div className="flex flex-row items-center justify-between">
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Formateur *
                  </label>
                  {user?.role === "formateur" ? (
                    <input
                      type="text"
                      name="userId"
                      value={user.name}
                      readOnly
                      className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                      style={{ backgroundColor: "#f9fafb" }}
                    />
                  ) : (
                    <select
                      name="userId"
                      value={formData.userId || ""}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="" disabled>
                        Select a formateur
                      </option>
                      {formateurs
                        .filter((formateur) => formateur.role === "formateur")
                        .map((formateur) => (
                          <option key={formateur.id} value={formateur.id}>
                            {formateur.name}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sélectionner les dates
                  </label>
                  <div className="relative max-w-sm mx-auto">
                    <button
                      onClick={() => !disabled && setIsOpen(!isOpen)}
                      disabled={disabled}
                      className={`w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span
                          className={
                            startDate && endDate
                              ? "text-gray-900"
                              : "text-gray-500"
                          }
                        >
                          {getDisplayText()}
                        </span>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg min-w-80">
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <ChevronLeftIcon className="w-4 h-4" />
                          </button>

                          <h3 className="text-lg font-semibold text-gray-900">
                            {months[currentMonth.getMonth()]}{" "}
                            {currentMonth.getFullYear()}
                          </h3>

                          <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDays.map((day) => (
                            <div
                              key={day}
                              className="p-2 text-center text-sm font-medium text-gray-500"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-4">
                          {days.map((date, index) => {
                            if (!date) {
                              return <div key={index} className="p-2"></div>;
                            }

                            const isSelected = isDateSelected(date);
                            const isInRange = isDateInRange(date);
                            const isToday =
                              date.toDateString() === today.toDateString();
                            const isStartDate =
                              startDate &&
                              date.toDateString() === startDate.toDateString();
                            const isEndDate =
                              endDate &&
                              date.toDateString() === endDate.toDateString();

                            let cellClasses =
                              "w-10 h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ";

                            if (isStartDate || isEndDate) {
                              cellClasses +=
                                "bg-blue-600 text-white font-semibold ";
                            } else if (isInRange) {
                              cellClasses += "bg-blue-100 text-blue-800 ";
                            } else {
                              cellClasses += "text-gray-700 hover:bg-gray-100 ";
                            }

                            if (isToday && !isSelected) {
                              cellClasses += "ring-2 ring-blue-300 ";
                            }

                            return (
                              <button
                                key={index}
                                onClick={() => handleDateClick(date)}
                                className={cellClasses}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <button
                            onClick={clearDates}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Effacer
                          </button>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => setIsOpen(false)}
                              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={confirmDates}
                              disabled={!startDate || !endDate}
                              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              Confirmer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {startDate && endDate && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-green-800">
                          <strong>Période sélectionnée:</strong>
                        </div>
                        <div className="text-sm text-green-700 mt-1">
                          Du {formatDate(startDate)} au {formatDate(endDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Describe what students will learn in this formation"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClass} h-32 resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Learning Objectives
                </label>
                <textarea
                  name="objectifs"
                  placeholder="What specific skills or knowledge will students gain?"
                  value={formData.objectifs}
                  onChange={handleChange}
                  className={`${inputClass} h-24 resize-none`}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={handleContinue}
                disabled={!canProceed(1)}
                className={`${buttonClass} ${
                  canProceed(1)
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </StepWrapper>
        )}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Type className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">
                Content & Modules
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Module creation form */}
              <div className="border border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {formData.modules && formData.modules.length > 0
                      ? `Create Module ${formData.modules.length + 1}`
                      : "Create Your First Module"}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Title *
                    </label>
                    <input
                      type="text"
                      value={currentModule.titre}
                      onChange={(e) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          titre: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Enter module title (e.g., Introduction to Programming)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={currentModule.description}
                      onChange={(e) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className={`${inputClass} h-24 resize-none`}
                      placeholder="Brief description of what this module covers"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={currentModule.duration}
                        onChange={(e) =>
                          setCurrentModule((prev) => ({
                            ...prev,
                            duration: parseInt(e.target.value) || 0,
                          }))
                        }
                        className={inputClass}
                        placeholder="Estimated duration"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        value={currentModule.order}
                        onChange={(e) =>
                          setCurrentModule((prev) => ({
                            ...prev,
                            order: parseInt(e.target.value) || 0,
                          }))
                        }
                        className={inputClass}
                        placeholder="Module order"
                        min="0"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addModule}
                    disabled={!currentModule.titre.trim() || loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                      currentModule.titre.trim() && !loading
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Module...
                      </>
                    ) : (
                      <>
                        <PlusIcon size={20} />
                        Add Module
                      </>
                    )}
                  </button>
                </div>
              </div>

              {Array.isArray(formData.modules) &&
                formData.modules.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircleIcon className="text-green-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Created Modules ({formData.modules.length})
                      </h3>
                    </div>

                    {formData.modules.map((module, index) => (
                      <div
                        key={module.id || index}
                        className="border border-gray-200 rounded-xl p-6 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <BookOpen size={20} className="text-green-600" />
                            {module.titre}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {module.duration} min
                            </span>
                            <button
                              onClick={() => removeModule(index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                              title="Remove Module"
                            >
                              <Trash2Icon size={18} />
                            </button>
                          </div>
                        </div>

                        {module.description && (
                          <p className="text-gray-600 text-sm mb-4">
                            {module.description}
                          </p>
                        )}

                        {/* Resources Section */}
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
                          <DynamicResourceTable
                            module={module}
                            index={index}
                            updateResource={updateResource}
                            removeResource={removeResource}
                            saveResource={saveResource}
                            savingResource={savingResource}
                            addResource={addResource}
                          />
                        </div>

                        {/* Questions Section */}
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-medium text-gray-800 flex items-center gap-2">
                              <HelpCircleIcon
                                size={18}
                                className="text-purple-600"
                              />
                              Quiz Questions
                            </h5>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => addQuiz(index)}
                                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium flex items-center gap-2"
                              >
                                <PlusIcon size={16} />
                                Add Question
                              </button>
                              {module.questions &&
                                module.questions.length > 0 && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        setLoading(true);
                                        setError(null);

                                        if (!module.id) {
                                          throw new Error(
                                            "Module ID is required to save questions"
                                          );
                                        }

                                        await saveQuizQuestions(
                                          module.id,
                                          module.questions
                                        );

                                        alert(
                                          "Quiz questions saved successfully!"
                                        );
                                      } catch (error) {
                                        console.error(
                                          "Error saving quiz questions:",
                                          error
                                        );
                                        setError(
                                          error instanceof Error
                                            ? error.message
                                            : "Failed to save quiz questions"
                                        );
                                      } finally {
                                        setLoading(false);
                                      }
                                    }}
                                    disabled={loading}
                                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <CheckIcon size={16} />
                                    {loading ? "Saving..." : "Save Quiz"}
                                  </button>
                                )}
                            </div>
                          </div>

                          {module.questions && module.questions.length > 0 ? (
                            <div className="space-y-4">
                              {module.questions.map(
                                (question, questionIndex) => (
                                  <div
                                    key={questionIndex}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <span className="text-sm font-medium text-gray-600">
                                        Question {questionIndex + 1}
                                      </span>
                                      <button
                                        onClick={() =>
                                          removeQuiz(index, questionIndex)
                                        }
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-all"
                                      >
                                        <XIcon size={14} />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={question.question || ""}
                                      onChange={(e) =>
                                        updateQuiz(
                                          index,
                                          questionIndex,
                                          "question",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-3"
                                      placeholder="Enter your question"
                                    />
                                    <div className="space-y-2">
                                      {["A", "B", "C", "D"].map(
                                        (option, optionIndex) => (
                                          <div
                                            key={option}
                                            className="flex items-center gap-3"
                                          >
                                            <span className="text-sm font-medium text-gray-600 w-6">
                                              {option}:
                                            </span>
                                            <input
                                              type="text"
                                              value={
                                                question.options?.[
                                                  optionIndex
                                                ] || ""
                                              }
                                              onChange={(e) =>
                                                updateQuestionOption(
                                                  index,
                                                  questionIndex,
                                                  optionIndex,
                                                  e.target.value
                                                )
                                              }
                                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                              placeholder={`Option ${option}`}
                                            />
                                            <input
                                              type="radio"
                                              name={`correct-${index}-${questionIndex}`}
                                              checked={
                                                question.correctAnswer ===
                                                optionIndex
                                              }
                                              onChange={() =>
                                                updateQuiz(
                                                  index,
                                                  questionIndex,
                                                  "correctAnswer",
                                                  optionIndex
                                                )
                                              }
                                              className="text-purple-600"
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <HelpCircleIcon
                                size={24}
                                className="mx-auto mb-2 text-gray-300"
                              />
                              <p className="text-sm">No questions added yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                <ArrowLeftIcon size={18} />
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!canProceed(2)}
                className={`${buttonClass} ${
                  canProceed(2)
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📊 Evaluation Test
              </h3>
              <p className="text-blue-700">
                Create an assessment to test participants&apos; understanding
                and knowledge level. This helps ensure learning objectives are
                met and provides valuable feedback.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableEvaluation"
                checked={formData.evaluationTest?.isEnabled || false}
                onChange={(e) =>
                  updateEvaluationSettings({ isEnabled: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label htmlFor="enableEvaluation" className="text-lg font-medium">
                Enable Evaluation Test for this Formation
              </label>
            </div>

            {formData.evaluationTest?.isEnabled && (
              <div className="space-y-6 border-t pt-6">
                {/* Test Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Test Title
                    </label>
                    <input
                      type="text"
                      value={formData.evaluationTest?.title}
                      onChange={(e) =>
                        updateEvaluationSettings({ title: e.target.value })
                      }
                      placeholder="e.g., Final Assessment"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.evaluationTest.timeLimit}
                      onChange={(e) =>
                        updateEvaluationSettings({
                          timeLimit: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={formData.evaluationTest.passingScore}
                      onChange={(e) =>
                        updateEvaluationSettings({
                          passingScore: parseInt(e.target.value),
                        })
                      }
                      min="0"
                      max="100"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.evaluationTest.description}
                      onChange={(e) =>
                        updateEvaluationSettings({
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the test..."
                      rows={3}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Questions List */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">
                      Questions (
                      {formData.evaluationTest.questions?.length || 0})
                    </h4>
                    {loading && <div className="text-blue-600">Loading...</div>}
                  </div>

                  <div className="space-y-3 mb-6">
                    {formData.evaluationTest.questions.map(
                      (question, index) => (
                        <div key={question.id}>
                          {editingQuestion === question.id ? (
                            <EditableQuestion
                              question={question}
                              onSave={(data) =>
                                updateQuestion(question.id, data)
                              }
                              onCancel={() => setEditingQuestion(null)}
                            />
                          ) : (
                            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    Q{index + 1}
                                  </span>
                                  <span className="bg-gray-200 px-2 py-1 rounded text-sm">
                                    {question.type}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {question.points} point
                                    {question.points !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <p className="font-medium">
                                  {question.question}
                                </p>
                                {question.type === "multiple-choice" &&
                                  question.options && (
                                    <div className="mt-2 text-sm">
                                      {question.options.map(
                                        (option, optIndex) => (
                                          <div
                                            key={optIndex}
                                            className={`ml-4 ${
                                              question.correctAnswer ===
                                              optIndex.toString()
                                                ? "font-semibold text-green-600"
                                                : ""
                                            }`}
                                          >
                                            {optIndex + 1}. {option}{" "}
                                            {question.correctAnswer ===
                                              optIndex.toString() && "✓"}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                {question.type === "true-false" && (
                                  <div className="mt-2 text-sm text-green-600 font-semibold">
                                    Correct:{" "}
                                    {question.correctAnswer === "true"
                                      ? "True"
                                      : "False"}
                                  </div>
                                )}
                                {question.explanation && (
                                  <div className="mt-2 text-sm text-gray-600 italic">
                                    Explanation: {question.explanation}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() =>
                                    setEditingQuestion(question.id)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                  title="Edit question"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => deleteQuestion(question.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete question"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Add Question Form */}
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <h5 className="font-semibold mb-4">Add New Question</h5>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Question Type
                          </label>
                          <select
                            value={currentQuestion.type}
                            onChange={(e) =>
                              setCurrentQuestion((prev) => ({
                                ...prev,
                                type: e.target.value as Question["type"],
                              }))
                            }
                            className="w-full p-3 border rounded-lg"
                          >
                            <option value="multiple-choice">
                              Multiple Choice
                            </option>
                            <option value="true-false">True/False</option>
                            <option value="short-answer">Short Answer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Points
                          </label>
                          <input
                            type="number"
                            value={currentQuestion.points}
                            onChange={(e) =>
                              setCurrentQuestion((prev) => ({
                                ...prev,
                                points: parseInt(e.target.value) || 1,
                              }))
                            }
                            min="1"
                            className="w-full p-3 border rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Question
                        </label>
                        <textarea
                          value={currentQuestion.question}
                          onChange={(e) =>
                            setCurrentQuestion((prev) => ({
                              ...prev,
                              question: e.target.value,
                            }))
                          }
                          placeholder="Enter your question here..."
                          rows={2}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>

                      {currentQuestion.type === "multiple-choice" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Answer Options
                          </label>
                          <div className="space-y-2">
                            {currentQuestion.options?.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={
                                    currentQuestion.correctAnswer ===
                                    index.toString()
                                  }
                                  onChange={() =>
                                    setCurrentQuestion((prev) => ({
                                      ...prev,
                                      correctAnswer: index.toString(),
                                    }))
                                  }
                                  className="w-4 h-4 text-blue-600"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [
                                      ...(currentQuestion.options || []),
                                    ];
                                    newOptions[index] = e.target.value;
                                    setCurrentQuestion((prev) => ({
                                      ...prev,
                                      options: newOptions,
                                    }));
                                  }}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1 p-2 border rounded"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentQuestion.type === "true-false" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Correct Answer
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="tfAnswer"
                                checked={
                                  currentQuestion.correctAnswer === "true"
                                }
                                onChange={() =>
                                  setCurrentQuestion((prev) => ({
                                    ...prev,
                                    correctAnswer: "true",
                                  }))
                                }
                                className="mr-2"
                              />
                              True
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="tfAnswer"
                                checked={
                                  currentQuestion.correctAnswer === "false"
                                }
                                onChange={() =>
                                  setCurrentQuestion((prev) => ({
                                    ...prev,
                                    correctAnswer: "false",
                                  }))
                                }
                                className="mr-2"
                              />
                              False
                            </label>
                          </div>
                        </div>
                      )}

                      {currentQuestion.type === "short-answer" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Sample Answer
                          </label>
                          <textarea
                            value={currentQuestion.correctAnswer}
                            onChange={(e) =>
                              setCurrentQuestion((prev) => ({
                                ...prev,
                                correctAnswer: e.target.value,
                              }))
                            }
                            placeholder="Provide a sample correct answer..."
                            rows={2}
                            className="w-full p-3 border rounded-lg"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Explanation (Optional)
                        </label>
                        <textarea
                          value={currentQuestion.explanation}
                          onChange={(e) =>
                            setCurrentQuestion((prev) => ({
                              ...prev,
                              explanation: e.target.value,
                            }))
                          }
                          placeholder="Explain the correct answer..."
                          rows={2}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>

                      <button
                        onClick={createQuestion}
                        disabled={!currentQuestion.question?.trim() || loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
                      >
                        {loading ? "Creating Question..." : "Create Question"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                <ArrowLeftIcon size={18} />
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className={`${buttonClass} ${
                  canProceed(3)
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
        {currentStep === 4 && (
          <StepWrapper
            title="Access Settings"
            subtitle="Configure who can access your formation"
          >
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Access Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      name="accessType"
                      value="private"
                      checked={formData.accessType === "private"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accessType: e.target.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        formData.accessType === "private"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.accessType === "private" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Private</span>
                      <p className="text-sm text-gray-500">Invitation only</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      name="accessType"
                      value="public"
                      checked={formData.accessType === "public"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accessType: e.target.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        formData.accessType === "public"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.accessType === "public" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Public</span>
                      <p className="text-sm text-gray-500">Open to everyone</p>
                    </div>
                  </label>
                </div>
              </div>

              {formData.accessType === "private" && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">
                    Invitation Settings
                  </h4>

                  <div className="flex gap-4 mb-6">
                    {[
                      {
                        value: "email",
                        icon: MailIcon,
                        label: "Email Invites",
                      },
                      { value: "link", icon: Link2Icon, label: "Invite Link" },
                      { value: "csv", icon: FileTextIcon, label: "CSV Upload" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center p-3 bg-white border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-all"
                      >
                        <input
                          type="radio"
                          name="invitationMode"
                          value={option.value}
                          checked={invitationData.mode === option.value}
                          onChange={(e) =>
                            setInvitationData((prev) => ({
                              ...prev,
                              mode: e.target.value,
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            invitationData.mode === option.value
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {invitationData.mode === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <option.icon size={16} className="mr-2 text-blue-600" />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {invitationData.mode === "email" && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Email Addresses</span>
                        <button
                          onClick={addEmail}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-all"
                        >
                          <PlusIcon size={14} /> Add Email
                        </button>
                      </div>
                      {invitationData.emails.map((email, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => updateEmail(index, e.target.value)}
                            className={`${inputClass} flex-1`}
                          />
                          {invitationData.emails.length > 1 && (
                            <button
                              onClick={() => removeEmail(index)}
                              className="px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2Icon size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {invitationData.mode === "link" && (
                    <div>
                      {!invitationData.linkGenerated ? (
                        <button
                          onClick={generateLink}
                          className={`${buttonClass} bg-green-600 hover:bg-green-700 text-white`}
                        >
                          <Link2Icon size={16} /> Generate Invitation Link
                        </button>
                      ) : (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 font-medium mb-2">
                            Invitation Link Generated:
                          </p>
                          <input
                            readOnly
                            value={invitationData.invitationLink}
                            className={`${inputClass} bg-white mb-2`}
                          />
                          <p className="text-sm text-gray-600">
                            <strong>Expires:</strong>{" "}
                            {formatExpirationDate(invitationData.expiresAt)}
                          </p>
                          {isLinkExpired(invitationData.expiresAt) && (
                            <p className="text-red-600 text-sm font-medium mt-1">
                              ⚠️ This link has expired
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {invitationData.mode === "csv" && (
                    <div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) =>
                          setInvitationData((prev) => ({
                            ...prev,
                            csvFile: e.target.files?.[0] || null,
                          }))
                        }
                        className={inputClass}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Expected format: CSV file with an &apos;email&apos;
                        column containing participant email addresses
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                <ArrowLeftIcon size={20} /> Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={isCreatingInvitation}
                className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCreatingInvitation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Review & Publish <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </StepWrapper>
        )}
        {currentStep === 5 && (
          <StepWrapper
            title="Review & Publish"
            subtitle="Review your formation before publishing"
          >
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setCurrentStep(4)}
                className={`${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
              >
                <ArrowLeftIcon size={20} />
                Back
              </button>
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className={`${buttonClass} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 flex-1`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircleIcon size={20} />
                    {submitButtonText}
                  </>
                )}
              </button>
            </div>
          </StepWrapper>
        )}
      </div>
    </div>
  );
};

export default FormationCreator;

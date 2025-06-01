"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  ArrowRight,
  BookOpen,
  Settings,
  Eye,
  Upload,
  Type,
  Trash2Icon,
  PlusIcon,
  ArrowLeftIcon,
  HelpCircleIcon,
  XIcon,
  FileTextIcon,
  CheckCircleIcon,
  SaveIcon,
  Link2Icon,
  MailIcon,
  RocketIcon,
  CheckIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";

interface Formateur {
  id: string;
  nom: string;
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
    type: "document" | "video" | "link" | "image";
    url: string;
    isSaved?: boolean;
  }[];
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface FormData {
  titre: string;
  domaine: string;
  image?: string;
  description: string;
  objectifs: string;
  accessType: string;
  formateurId: string;
  modules: ModuleData[];
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

const FormationCreator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const { user } = useAuth();
  const [formationId, setFormationId] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    titre: "",
    domaine: "",
    image: "",
    description: "",
    objectifs: "",
    accessType: "public",
    formateurId: user?.role === "formateur" ? user.id : "",
    modules: [],
  });
  const [invitationData, setInvitationData] = useState({
    mode: "email",
    emails: [""],
    invitationLink: "",
    linkGenerated: false,
    csvFile: null as File | null,
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
  const [isSubmitting] = useState(false);
  const router = useRouter();

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
      title: "Settings",
      icon: Settings,
      description: "Access & invitations",
    },
    { number: 4, title: "Preview", icon: Eye, description: "Review & publish" },
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

  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3001/formateur", {
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
      } catch (error) {
        console.error("Error fetching formateurs:", error);
      }
    };

    fetchFormateurs();
  }, []);

  const createFormation = async (formData: unknown) => {
    try {
      const response = await fetch("/api/formations/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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

  const addQuestion = (moduleIndex: number) => {
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

  const removeQuestion = (moduleIndex: number, questionIndex: number) => {
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

  const updateQuestion = (
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

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.titre.trim() &&
          formData.domaine.trim() &&
          formData.description.trim() &&
          formData.objectifs.trim() &&
          formData.accessType &&
          formData.formateurId &&
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

  const handleContinue = async () => {
    setError(null);
    setLoading(true);

    try {
      console.log("Attempting to create formation...");

      // Validate formateur selection
      if (!formData.formateurId) {
        throw new Error("Please select a formateur");
      }

      // Check if selected formateur exists
      const selectedFormateur = formateurs.find(
        (f) => f.id === formData.formateurId
      );
      if (!selectedFormateur) {
        throw new Error(
          "Selected formateur is not valid. Please select a different formateur."
        );
      }

      const createdFormationId = await createFormation(formData);
      console.log("Formation created with ID:", createdFormationId);

      setFormationId(createdFormationId);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error in handleContinue:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const addModule = async () => {
    if (!formationId) {
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
        formationId: formationId,
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

    if (!resource.title.trim() || !resource.url.trim()) {
      setError("Resource title and URL are required");
      return;
    }

    try {
      setSavingResource(`${moduleIndex}-${resourceIndex}`);
      setError(null);

      const savedResource = await createResource({
        title: resource.title,
        type: resource.type,
        url: resource.url,
        moduleId: currentModule.id,
      });

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

      // Show success feedback briefly
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

  const generateLink = () => {
    const linkId = Math.random().toString(36).substring(2, 15);
    const generatedLink = `https://your-platform.com/invite/${linkId}`;

    setInvitationData((prev) => ({
      ...prev,
      invitationLink: generatedLink,
      linkGenerated: true,
    }));
  };

  const createInvitation = async () => {
    if (!formationId) {
      console.error("Formation ID is required");
      return false;
    }

    if (formData.accessType !== "private") {
      return true; // No invitation needed for public formations
    }

    try {
      setIsCreatingInvitation(true);

      const invitationPayload: any = {
        mode: invitationData.mode,
        formationId: formationId,
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
            // Generate a unique invitation link
            const linkId = Math.random().toString(36).substring(2, 15);
            invitationPayload.invitationLink = `https://your-platform.com/invite/${linkId}`;
            invitationPayload.linkGenerated = true;
          } else {
            invitationPayload.invitationLink = invitationData.invitationLink;
            invitationPayload.linkGenerated = true;
          }
          break;

        case "csv":
          if (!invitationData.csvFile) {
            throw new Error("CSV file is required");
          }

          // For CSV, you might need to handle file upload differently
          // This is a simplified approach - you may need to upload the file first
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
      return true;
    } catch (error) {
      console.error("Error creating invitation:", error);
      alert(`Error creating invitation: ${error.message}`);
      return false;
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  const handleNextStep = async () => {
    const success = await createInvitation();
    if (success) {
      setCurrentStep(4);
    }
  };

  const handlePublish = async () => {
    router.push("/dashboard/formateur/formations/");
  };

  const saveQuizQuestions = async (
    moduleId: string,
    questions:
      | { question: string; options: string[]; correctAnswer: number }[]
      | undefined
  ) => {
    try {
      if (!formationId) {
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
          formationId: formationId,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create New Formation
          </h1>
          <p className="text-gray-600 text-lg">
            Build engaging learning experiences step by step
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
                  <input
                    name="domaine"
                    placeholder="e.g. Web Development, Marketing"
                    value={formData.domaine}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <div className="relative">
                  <input
                    name="image"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <Upload
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Formateur *
                </label>
                <select
                  name="formateurId"
                  value={formData.formateurId || ""}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer`}
                  // disabled={user?.role === "formateur"}
                >
                  <option value="" disabled>
                    Select a formateur
                  </option>
                  {formateurs.map((formateur) => (
                    <option key={formateur.id} value={formateur.id}>
                      {formateur.nom}
                    </option>
                  ))}
                </select>
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
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-medium text-gray-800 flex items-center gap-2">
                              <FileTextIcon
                                size={18}
                                className="text-green-600"
                              />
                              Resources
                            </h5>
                            <button
                              onClick={() => addResource(index)}
                              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium flex items-center gap-2"
                            >
                              <PlusIcon size={16} />
                              Add Resource
                            </button>
                          </div>

                          {module.resources && module.resources.length > 0 ? (
                            <div className="space-y-3">
                              {module.resources.map(
                                (resource, resourceIndex) => (
                                  <div
                                    key={resourceIndex}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        value={resource.title || ""}
                                        onChange={(e) =>
                                          updateResource(
                                            index,
                                            resourceIndex,
                                            "title",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                        placeholder="Resource title"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <select
                                        value={resource.type || "document"}
                                        onChange={(e) =>
                                          updateResource(
                                            index,
                                            resourceIndex,
                                            "type",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                      >
                                        <option value="document">
                                          Document
                                        </option>
                                        <option value="video">Video</option>
                                        <option value="link">Link</option>
                                        <option value="image">Image</option>
                                      </select>
                                    </div>
                                    <div className="flex-1">
                                      <input
                                        type="url"
                                        value={resource.url || ""}
                                        onChange={(e) =>
                                          updateResource(
                                            index,
                                            resourceIndex,
                                            "url",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                        placeholder="Resource URL"
                                      />
                                    </div>
                                    <div className="flex flex-row justify-between space-x-2">
                                      <button
                                        onClick={() =>
                                          removeResource(index, resourceIndex)
                                        }
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                      >
                                        <XIcon size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          saveResource(index, resourceIndex)
                                        }
                                        disabled={
                                          savingResource ===
                                          `${index}-${resourceIndex}`
                                        }
                                        className={`p-2 rounded-lg transition-all ${
                                          savingResource ===
                                          `${index}-${resourceIndex}`
                                            ? "text-gray-400 cursor-not-allowed"
                                            : resource.isSaved
                                            ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                            : "text-green-400 hover:text-green-600 hover:bg-green-50"
                                        }`}
                                      >
                                        {savingResource ===
                                        `${index}-${resourceIndex}` ? (
                                          <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" />
                                        ) : (
                                          <SaveIcon size={16} />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <FileTextIcon
                                size={24}
                                className="mx-auto mb-2 text-gray-300"
                              />
                              <p className="text-sm">No resources added yet</p>
                            </div>
                          )}
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
                                onClick={() => addQuestion(index)}
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
                                          removeQuestion(index, questionIndex)
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
                                        updateQuestion(
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
                                                updateQuestion(
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
                            className={`${inputClass} bg-white`}
                          />
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
        {currentStep === 4 && (
          <StepWrapper
            title="Review & Publish"
            subtitle="Final check before launching your formation"
          >
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Formation Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Title:</span>
                    <p className="text-gray-600">
                      {formData.titre || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Domain:</span>
                    <p className="text-gray-600">
                      {formData.domaine || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Access Type:
                    </span>
                    <p className="text-gray-600 capitalize">
                      {formData.accessType}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Modules:
                    </span>
                    <p className="text-gray-600">
                      {formData.modules.length} module(s)
                    </p>
                  </div>
                </div>
                {formData.description && (
                  <div className="mt-4">
                    <span className="font-semibold text-gray-700">
                      Description:
                    </span>
                    <p className="text-gray-600 mt-1">{formData.description}</p>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <Check size={20} /> Pre-publication Checklist
                </h4>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-amber-600" />
                    All modules have titles and content
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-amber-600" />
                    Resource URLs are valid and accessible
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-amber-600" />
                    Access settings are configured correctly
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-amber-600" />
                    Formation details are complete and accurate
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-800">
                      I confirm that all information is correct and I want to
                      publish this formation
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Once published, participants will be able to access the
                      formation according to your access settings.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(3)}
                className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                <ArrowLeftIcon size={20} /> Previous
              </button>
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className={`${buttonClass} ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                } text-white px-8`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <RocketIcon size={20} /> Publish Formation
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

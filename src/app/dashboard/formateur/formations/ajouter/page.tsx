"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Mail,
  Link2,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Settings,
  Eye,
  Upload,
  Video,
  FileImage,
  Type,
  SendIcon,
} from "lucide-react";
import { Formateur } from "../../formateurs/page";
import { useRouter } from "next/navigation";

type Resource = {
  type: string;
  url: string;
  content: string;
};

type Module = {
  titre: string;
  resources: Resource[];
  questions: unknown[];
};

type Invitation = {
  mode: string;
  emails: string[];
  linkGenerated: boolean;
  csvFile: File | null;
};

type FormDataType = {
  titre: string;
  domaine: string;
  image: string;
  description: string;
  objectifs: string;
  accessType: string;
  invitation: Invitation;
  modules: Module[];
  formateurId: string;
};

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
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>({
    titre: "",
    domaine: "",
    image: "",
    description: "",
    objectifs: "",
    accessType: "private",
    formateurId: "",
    invitation: {
      mode: "email",
      emails: [""],
      linkGenerated: false,
      csvFile: null,
    },
    modules: [
      {
        titre: "",
        resources: [],
        questions: [],
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { titre: "", resources: [], questions: [] }],
    }));
  };

  const removeModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const updateModule = (moduleIndex: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex ? { ...module, [field]: value } : module
      ),
    }));
  };

  const addResource = (moduleIndex: number, type: string) => {
    const newResource = { type, url: "", content: "" };
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? { ...module, resources: [...module.resources, newResource] }
          : module
      ),
    }));
  };

  const removeResource = (moduleIndex: number, resourceIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              resources: module.resources.filter((_, j) => j !== resourceIndex),
            }
          : module
      ),
    }));
  };

  const addEmail = () => {
    setFormData((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        emails: [...prev.invitation.emails, ""],
      },
    }));
  };

  const removeEmail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        emails: prev.invitation.emails.filter((_, i) => i !== index),
      },
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        emails: prev.invitation.emails.map((email, i) =>
          i === index ? value : email
        ),
      },
    }));
  };

  const generateLink = () => {
    setFormData((prev) => ({
      ...prev,
      invitation: { ...prev.invitation, linkGenerated: true },
    }));
  };

  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await fetch("http://localhost:3001/formateur", {
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/formations/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create formation");
      }

      const result = await response.json();
      console.log("Formation created successfully:", result);
      setSubmitSuccess(true);

      setTimeout(() => {
        setFormData({
          titre: "",
          domaine: "",
          image: "",
          description: "",
          objectifs: "",
          accessType: "private",
          formateurId: "",
          invitation: {
            mode: "email",
            emails: [""],
            linkGenerated: false,
            csvFile: null,
          },
          modules: [
            {
              titre: "",
              resources: [],
              questions: [],
            },
          ],
        });
        router.push("/dashboard/formateur/formations");
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating formation:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return formData.titre && formData.domaine && formData.description;
      case 2:
        return formData.modules.every((module) => module.titre);
      default:
        return true;
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

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setCurrentStep(2)}
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
          <StepWrapper
            title="Course Content"
            subtitle="Structure your learning modules"
          >
            <div className="space-y-8">
              {formData.modules.map((module, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Module {index + 1}
                    </h3>
                    {formData.modules.length > 1 && (
                      <button
                        onClick={() => removeModule(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Module Title *
                    </label>
                    <input
                      placeholder="Enter module title"
                      value={module.titre}
                      onChange={(e) =>
                        updateModule(index, "titre", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-700">Resources</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addResource(index, "video")}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm flex items-center gap-2 transition-all"
                        >
                          <Video size={16} /> Video
                        </button>
                        <button
                          onClick={() => addResource(index, "pdf")}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 transition-all"
                        >
                          <FileImage size={16} /> PDF
                        </button>
                        <button
                          onClick={() => addResource(index, "text")}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 transition-all"
                        >
                          <Type size={16} /> Text
                        </button>
                      </div>
                    </div>

                    {module.resources.map((resource, resourceIndex) => (
                      <div
                        key={resourceIndex}
                        className="bg-white p-4 rounded-lg mb-3 border border-gray-200"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium capitalize">
                            {resource.type}
                          </span>
                          <button
                            onClick={() => removeResource(index, resourceIndex)}
                            className="text-red-500 hover:text-red-600 p-1 rounded transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {resource.type === "text" ? (
                          <textarea
                            placeholder="Enter text content..."
                            value={resource.content || ""}
                            onChange={(e) => {
                              const newModules = [...formData.modules];
                              newModules[index].resources[
                                resourceIndex
                              ].content = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                modules: newModules,
                              }));
                            }}
                            className={`${inputClass} h-20`}
                          />
                        ) : (
                          <input
                            placeholder={`Enter ${resource.type} URL...`}
                            value={resource.url || ""}
                            onChange={(e) => {
                              const newModules = [...formData.modules];
                              newModules[index].resources[resourceIndex].url =
                                e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                modules: newModules,
                              }));
                            }}
                            className={inputClass}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={addModule}
                className={`${buttonClass} bg-purple-600 hover:bg-purple-700 text-white w-full justify-center shadow-lg hover:shadow-xl`}
              >
                <Plus size={20} /> Add New Module
              </button>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                <ArrowLeft size={20} /> Previous
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
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </StepWrapper>
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      { value: "email", icon: Mail, label: "Email Invites" },
                      { value: "link", icon: Link2, label: "Invite Link" },
                      { value: "csv", icon: FileText, label: "CSV Upload" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center p-3 bg-white border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-all"
                      >
                        <input
                          type="radio"
                          name="invitationMode"
                          value={option.value}
                          checked={formData.invitation.mode === option.value}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              invitation: {
                                ...prev.invitation,
                                mode: e.target.value,
                              },
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            formData.invitation.mode === option.value
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.invitation.mode === option.value && (
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

                  {formData.invitation.mode === "email" && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Email Addresses</span>
                        <button
                          onClick={addEmail}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-all"
                        >
                          <Plus size={14} /> Add Email
                        </button>
                      </div>
                      {formData.invitation.emails.map((email, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => updateEmail(index, e.target.value)}
                            className={`${inputClass} flex-1`}
                          />
                          {formData.invitation.emails.length > 1 && (
                            <button
                              onClick={() => removeEmail(index)}
                              className="px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.invitation.mode === "link" && (
                    <div>
                      {!formData.invitation.linkGenerated ? (
                        <button
                          onClick={generateLink}
                          className={`${buttonClass} bg-green-600 hover:bg-green-700 text-white`}
                        >
                          <Link2 size={16} /> Generate Invitation Link
                        </button>
                      ) : (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 font-medium mb-2">
                            Invitation Link Generated:
                          </p>
                          <input
                            readOnly
                            value="https://your-platform.com/invite/abc123xyz"
                            className={`${inputClass} bg-white`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {formData.invitation.mode === "csv" && (
                    <div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            invitation: {
                              ...prev.invitation,
                              csvFile: e.target.files?.[0] || null,
                            },
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
                <ArrowLeft size={20} /> Previous
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl`}
              >
                Review & Publish <ArrowRight size={20} />
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
                <ArrowLeft size={20} /> Previous
              </button>
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}

              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700">
                    Formation created successfully!
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${buttonClass} ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white w-full justify-center text-lg py-4`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Formation...
                  </>
                ) : (
                  <>
                    <SendIcon size={20} />
                    Publish Formation
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

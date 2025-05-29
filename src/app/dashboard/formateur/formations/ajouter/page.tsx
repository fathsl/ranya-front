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
} from "lucide-react";
import { useAuth } from "@/contexts/authContext";

interface Formateur {
  id: string;
  nom: string;
}

interface FormData {
  titre: string;
  domaine: string;
  image?: string;
  description: string;
  objectifs: string;
  accessType: string;
  formateurId: string;
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
  const [formData, setFormData] = useState<FormData>({
    titre: "",
    domaine: "",
    image: "",
    description: "",
    objectifs: "",
    accessType: "public",
    formateurId: "",
  });
  const [error, setError] = useState<string | null>(null);

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

  const canProceed = () => {
    return (
      formData.titre.trim() &&
      formData.domaine.trim() &&
      formData.description.trim() &&
      formData.objectifs.trim() &&
      formData.accessType &&
      formData.formateurId
    );
  };

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

  const handleContinue = async () => {
    setError(null);
    try {
      const formationId = await createFormation(formData);
      console.log("Formation created with ID:", formationId);
      setCurrentStep(2); // Proceed to next step on success
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
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
                disabled={!canProceed()}
                className={`${buttonClass} ${
                  canProceed()
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </StepWrapper>
        )}
      </div>
    </div>
  );
};

export default FormationCreator;

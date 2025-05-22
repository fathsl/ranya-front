"use client";

import { TimelineStepper } from "@/components/TimelineStepper";
import {
  FileTextIcon,
  Link2Icon,
  MailIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import React, { useState } from "react";

interface QCMOption {
  texte: string;
  justification: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  options: QCMOption[];
}

interface Resource {
  type: "video" | "pdf" | "word" | "paragraph" | "table";
  url?: string;
  content?: string;
  columns?: string[];
  rows?: string[][];
}

interface Module {
  titre: string;
  questions: Question[];
  resources: Resource[];
}

interface Invitation {
  mode: "email" | "link" | "csv";
  emails: string[];
  linkGenerated: boolean;
  csvFile: File | null;
}

interface FormData {
  titre: string;
  image: string;
  domaine: string;
  description: string;
  objectifs: string;
  modules: Module[];
  accessType: "private" | "public";
  invitation: Invitation;
}

export default function AjouterFormation() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    titre: "",
    image: "",
    domaine: "",
    description: "",
    objectifs: "",
    modules: [{ titre: "", questions: [], resources: [] }],
    accessType: "private",
    invitation: {
      mode: "email",
      emails: [""],
      linkGenerated: false,
      csvFile: null,
    },
  });

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent";
  const buttonClass = "px-4 py-2 rounded-md font-medium transition-colors";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleStepClick = (targetStep: number) => {
    setStep(targetStep);
  };

  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { titre: "", questions: [], resources: [] }],
    }));
  };

  const removeModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const updateModule = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === index ? { ...module, [field]: value } : module
      ),
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
                ...module.questions,
                {
                  question: "",
                  options: [
                    { texte: "", justification: "", isCorrect: false },
                    { texte: "", justification: "", isCorrect: false },
                  ],
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
              questions: module.questions.filter(
                (_, qi) => qi !== questionIndex
              ),
            }
          : module
      ),
    }));
  };

  const updateQuestion = (
    moduleIndex: number,
    questionIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              questions: module.questions.map((q, qi) =>
                qi === questionIndex ? { ...q, question: value } : q
              ),
            }
          : module
      ),
    }));
  };

  const addOption = (moduleIndex: number, questionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              questions: module.questions.map((q, qi) =>
                qi === questionIndex
                  ? {
                      ...q,
                      options: [
                        ...q.options,
                        { texte: "", justification: "", isCorrect: false },
                      ],
                    }
                  : q
              ),
            }
          : module
      ),
    }));
  };

  const updateOption = (
    moduleIndex: number,
    questionIndex: number,
    optionIndex: number,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              questions: module.questions.map((q, qi) =>
                qi === questionIndex
                  ? {
                      ...q,
                      options: q.options.map((opt, oi) =>
                        oi === optionIndex ? { ...opt, [field]: value } : opt
                      ),
                    }
                  : q
              ),
            }
          : module
      ),
    }));
  };

  const addResource = (moduleIndex: number, type: Resource["type"]) => {
    const newResource: Resource = { type };

    if (type === "paragraph") {
      newResource.content = "";
    } else if (type === "table") {
      newResource.columns = [""];
      newResource.rows = [[""]];
    } else {
      newResource.url = "";
    }

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
              resources: module.resources.filter(
                (_, ri) => ri !== resourceIndex
              ),
            }
          : module
      ),
    }));
  };

  const updateResource = (
    moduleIndex: number,
    resourceIndex: number,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              resources: module.resources.map((res, ri) =>
                ri === resourceIndex ? { ...res, [field]: value } : res
              ),
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

  const removeEmail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        emails: prev.invitation.emails.filter((_, i) => i !== index),
      },
    }));
  };

  const generateLink = () => {
    setFormData((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        linkGenerated: true,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const csvFileBase64 = formData.invitation.csvFile
        ? await convertFileToBase64(formData.invitation.csvFile)
        : null;

      const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

      const response = await fetch(`${backendUrl}/formations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre: formData.titre,
          image: formData.image,
          domaine: formData.domaine,
          description: formData.description,
          objectifs: formData.objectifs,
          accessType: formData.accessType,
          invitation: {
            mode: formData.invitation.mode,
            emails: formData.invitation.emails.filter(
              (email) => email.trim() !== ""
            ),
            linkGenerated: formData.invitation.linkGenerated,
            csvFile: csvFileBase64,
          },
          modules: formData.modules.map((module) => ({
            titre: module.titre,
            questions: module.questions,
            resources: module.resources.map((resource) => ({
              ...resource,
              url: resource.type !== "paragraph" ? resource.url : undefined,
              rows:
                resource.type === "table"
                  ? resource.rows?.filter((row) =>
                      row.some((cell) => cell.trim() !== "")
                    )
                  : undefined,
            })),
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Erreur lors de la création";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(`${response.status}: ${errorMessage}`);
      }

      const responseData = await response.json();

      alert("Formation créée avec succès !");
      console.log("Created formation:", responseData);

      setFormData({
        titre: "",
        image: "",
        domaine: "",
        description: "",
        objectifs: "",
        modules: [{ titre: "", questions: [], resources: [] }],
        accessType: "private",
        invitation: {
          mode: "email",
          emails: [""],
          linkGenerated: false,
          csvFile: null,
        },
      });
    } catch (error) {
      alert(error.message || "Erreur lors de la création de la formation");
      console.error("Error details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const StepWrapper = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.titre && formData.domaine && formData.description;
      case 2:
        return formData.modules.length > 0 && formData.modules[0].titre;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        ➕ Ajouter une Formation
      </h1>

      <div className="max-w-4xl mx-auto">
        <TimelineStepper
          currentStep={step}
          onStepClick={handleStepClick}
          totalSteps={4}
        />

        {step === 1 && (
          <StepWrapper title="Étape 1 : Informations générales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="titre"
                placeholder="Titre de la formation *"
                value={formData.titre}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <input
                name="domaine"
                placeholder="Domaine *"
                value={formData.domaine}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <input
              name="image"
              placeholder="URL de l'image de couverture"
              value={formData.image}
              onChange={handleChange}
              className={inputClass}
            />
            <textarea
              name="description"
              placeholder="Description de la formation *"
              value={formData.description}
              onChange={handleChange}
              className={`${inputClass} h-32`}
              required
            />
            <textarea
              name="objectifs"
              placeholder="Objectifs pédagogiques"
              value={formData.objectifs}
              onChange={handleChange}
              className={`${inputClass} h-24`}
            />

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed(1)}
                className={`${buttonClass} ${
                  canProceed(1)
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Suivant
              </button>
            </div>
          </StepWrapper>
        )}

        {step === 2 && (
          <StepWrapper title="Étape 2 : Contenu détaillé">
            <div className="space-y-6">
              {formData.modules.map((module, moduleIndex) => (
                <div
                  key={moduleIndex}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium">
                      Module {moduleIndex + 1}
                    </h4>
                    {formData.modules.length > 1 && (
                      <button
                        onClick={() => removeModule(moduleIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2Icon size={16} />
                      </button>
                    )}
                  </div>

                  <input
                    placeholder="Titre du module *"
                    value={module.titre}
                    onChange={(e) =>
                      updateModule(moduleIndex, "titre", e.target.value)
                    }
                    className={`${inputClass} mb-4`}
                    required
                  />

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Ressources</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addResource(moduleIndex, "video")}
                          className={`${buttonClass} bg-blue-500 hover:bg-blue-600 text-white text-sm`}
                        >
                          Vidéo
                        </button>
                        <button
                          onClick={() => addResource(moduleIndex, "pdf")}
                          className={`${buttonClass} bg-red-500 hover:bg-red-600 text-white text-sm`}
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => addResource(moduleIndex, "paragraph")}
                          className={`${buttonClass} bg-green-500 hover:bg-green-600 text-white text-sm`}
                        >
                          Texte
                        </button>
                      </div>
                    </div>

                    {module.resources.map((resource, resourceIndex) => (
                      <div
                        key={resourceIndex}
                        className="border p-3 rounded mb-2 bg-white"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium capitalize">
                            {resource.type}
                          </span>
                          <button
                            onClick={() =>
                              removeResource(moduleIndex, resourceIndex)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2Icon size={14} />
                          </button>
                        </div>

                        {resource.type === "paragraph" ? (
                          <textarea
                            placeholder="Contenu du paragraphe..."
                            value={resource.content || ""}
                            onChange={(e) =>
                              updateResource(
                                moduleIndex,
                                resourceIndex,
                                "content",
                                e.target.value
                              )
                            }
                            className={`${inputClass} h-20`}
                          />
                        ) : (
                          <input
                            placeholder={`URL du ${resource.type}...`}
                            value={resource.url || ""}
                            onChange={(e) =>
                              updateResource(
                                moduleIndex,
                                resourceIndex,
                                "url",
                                e.target.value
                              )
                            }
                            className={inputClass}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Questions QCM</h5>
                      <button
                        onClick={() => addQuestion(moduleIndex)}
                        className={`${buttonClass} bg-purple-500 hover:bg-purple-600 text-white text-sm`}
                      >
                        <PlusIcon size={16} className="inline mr-1" />
                        Ajouter Question
                      </button>
                    </div>

                    {module.questions.map((question, questionIndex) => (
                      <div
                        key={questionIndex}
                        className="border p-3 rounded mb-2 bg-white"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Question {questionIndex + 1}
                          </span>
                          <button
                            onClick={() =>
                              removeQuestion(moduleIndex, questionIndex)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2Icon size={14} />
                          </button>
                        </div>

                        <input
                          placeholder="Question..."
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(
                              moduleIndex,
                              questionIndex,
                              e.target.value
                            )
                          }
                          className={`${inputClass} mb-2`}
                        />

                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={(e) =>
                                  updateOption(
                                    moduleIndex,
                                    questionIndex,
                                    optionIndex,
                                    "isCorrect",
                                    e.target.checked
                                  )
                                }
                                className="text-orange-500"
                              />
                              <input
                                placeholder="Option..."
                                value={option.texte}
                                onChange={(e) =>
                                  updateOption(
                                    moduleIndex,
                                    questionIndex,
                                    optionIndex,
                                    "texte",
                                    e.target.value
                                  )
                                }
                                className="flex-1 p-2 border rounded"
                              />
                              <input
                                placeholder="Justification..."
                                value={option.justification}
                                onChange={(e) =>
                                  updateOption(
                                    moduleIndex,
                                    questionIndex,
                                    optionIndex,
                                    "justification",
                                    e.target.value
                                  )
                                }
                                className="flex-1 p-2 border rounded"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              addOption(moduleIndex, questionIndex)
                            }
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            + Ajouter option
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={addModule}
                className={`${buttonClass} bg-orange-500 hover:bg-orange-600 text-white w-full`}
              >
                <PlusIcon size={16} className="inline mr-1" />
                Ajouter Module
              </button>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                Précédent
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceed(2)}
                className={`${buttonClass} ${
                  canProceed(2)
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Suivant
              </button>
            </div>
          </StepWrapper>
        )}

        {step === 3 && (
          <StepWrapper title="Étape 3 : Configuration">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d&apos;accès
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessType"
                      value="private"
                      checked={formData.accessType === "private"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Privé (sur invitation)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessType"
                      value="public"
                      checked={formData.accessType === "public"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Public
                  </label>
                </div>
              </div>

              {formData.accessType === "private" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode d&apos;invitation
                  </label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="invitationMode"
                        value="email"
                        checked={formData.invitation.mode === "email"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            invitation: {
                              ...prev.invitation,
                              mode: e.target.value as "email" | "link" | "csv",
                            },
                          }))
                        }
                        className="mr-2"
                      />
                      <MailIcon size={16} className="mr-1" />
                      Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="invitationMode"
                        value="link"
                        checked={formData.invitation.mode === "link"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            invitation: {
                              ...prev.invitation,
                              mode: e.target.value as "email" | "link" | "csv",
                            },
                          }))
                        }
                        className="mr-2"
                      />
                      <Link2Icon size={16} className="mr-1" />
                      Lien
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="invitationMode"
                        value="csv"
                        checked={formData.invitation.mode === "csv"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            invitation: {
                              ...prev.invitation,
                              mode: e.target.value as "email" | "link" | "csv",
                            },
                          }))
                        }
                        className="mr-2"
                      />
                      <FileTextIcon size={16} className="mr-1" />
                      CSV
                    </label>
                  </div>

                  {formData.invitation.mode === "email" && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Adresses email
                        </span>
                        <button
                          onClick={addEmail}
                          className={`${buttonClass} bg-blue-500 hover:bg-blue-600 text-white text-sm`}
                        >
                          <PlusIcon size={14} className="inline mr-1" />
                          Ajouter
                        </button>
                      </div>
                      {formData.invitation.emails.map((email, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => updateEmail(index, e.target.value)}
                            className={`${inputClass} flex-1`}
                          />
                          {formData.invitation.emails.length > 1 && (
                            <button
                              onClick={() => removeEmail(index)}
                              className="text-red-500 hover:text-red-700 px-2"
                            >
                              <Trash2Icon size={16} />
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
                          className={`${buttonClass} bg-green-500 hover:bg-green-600 text-white`}
                        >
                          Générer lien d&apos;invitation
                        </button>
                      ) : (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-700 mb-2">
                            Lien généré :
                          </p>
                          <input
                            readOnly
                            value="https://votre-app.com/invitation/abc123"
                            className={`${inputClass} bg-gray-50`}
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
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData((prev) => ({
                            ...prev,
                            invitation: { ...prev.invitation, csvFile: file },
                          }));
                        }}
                        className={inputClass}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Format attendu : une colonne email avec les adresses
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(2)}
                className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                Précédent
              </button>
              <button
                onClick={() => setStep(4)}
                className={`${buttonClass} bg-orange-500 hover:bg-orange-600 text-white`}
              >
                Suivant
              </button>
            </div>
          </StepWrapper>
        )}

        {step === 4 && (
          <StepWrapper title="Étape 4 : Publication">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">
                  Récapitulatif de la formation
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Titre :</strong> {formData.titre}
                  </p>
                  <p>
                    <strong>Domaine :</strong> {formData.domaine}
                  </p>
                  <p>
                    <strong>Description :</strong> {formData.description}
                  </p>
                  <p>
                    <strong>Modules :</strong> {formData.modules.length}
                  </p>
                  <p>
                    <strong>Type d&apos;accès :</strong>{" "}
                    {formData.accessType === "private" ? "Privé" : "Public"}
                  </p>
                  {formData.accessType === "private" && (
                    <p>
                      <strong>Mode d&apos;invitation :</strong>{" "}
                      {formData.invitation.mode}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">
                  Avant de publier
                </h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Vérifiez que tous les modules ont un titre</li>
                  <li>
                    • Assurez-vous que les questions ont au moins une bonne
                    réponse
                  </li>
                  <li>• Vérifiez les URLs des ressources</li>
                  <li>
                    • Confirmez les informations d&apos;invitation si accès
                    privé
                  </li>
                </ul>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmPublication"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="confirmPublication"
                  className="text-sm text-gray-700"
                >
                  Je confirme que toutes les informations sont correctes et je
                  souhaite publier cette formation
                </label>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(3)}
                className={`${buttonClass} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                Précédent
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${buttonClass} ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {isSubmitting ? "Publication..." : "Publier la Formation"}
              </button>
            </div>
          </StepWrapper>
        )}
      </div>
    </main>
  );
}

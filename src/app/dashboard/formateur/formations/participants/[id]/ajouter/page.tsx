"use client";

import React, { useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  KeyIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import bcrypt from "bcryptjs";
import { useParams, useRouter } from "next/navigation";

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    telephone: "",
    role: "participant",
    status: "active",
    hasCertificate: false,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const params = useParams();
  const id = params.id as string;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const statusOptions = ["active", "inactive", "suspended"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess("");
  };

  const validatePassword = (password: string | unknown[]) => {
    return password.length >= 6;
  };

  const hashPassword = async (password: string) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  };

  const getFormationName = async (id: string) => {
    try {
      const response = await fetch(`/api/formations/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch formation details");
      }

      return result.data?.name || "Formation";
    } catch (error) {
      console.error("Error fetching formation name:", error);
      return "Formation"; // Default fallback
    }
  };

  const sendWelcomeEmail = async (
    recipientEmail: string,
    recipientName: string,
    password: string,
    formationName: string
  ) => {
    try {
      const response = await fetch("/api/send-welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          password,
          formationName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send welcome email");
      }

      return result;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error("Veuillez entrer une adresse email valide");
      }

      if (!validatePassword(formData.password)) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      if (!id) {
        throw new Error("ID de formation manquant");
      }

      // Store the plain password before hashing
      const plainPassword = formData.password;
      const hashedPassword = await hashPassword(formData.password);

      const userData = {
        name: formData.name,
        email: formData.email,
        password: hashedPassword,
        telephone: formData.telephone || undefined,
        role: formData.role,
        status: formData.status,
        hasCertificate: formData.hasCertificate,
        formationId: id,
      };

      console.log("Submitting user data:", {
        ...userData,
        password: "[HASHED]",
      });

      // Create the user
      const response = await fetch("/api/users/addUserWithFormation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Une erreur est survenue"
        );
      }

      try {
        const formationName = await getFormationName(id);

        await sendWelcomeEmail(
          formData.email,
          formData.name,
          plainPassword,
          formationName
        );

        setSuccess(
          `${
            result.message || "Participant ajouté avec succès à la formation !"
          } Un email de bienvenue a été envoyé.`
        );
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        setSuccess(
          `${
            result.message || "Participant ajouté avec succès à la formation !"
          } Cependant, l'email de bienvenue n'a pas pu être envoyé.`
        );
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        telephone: "",
        role: "participant",
        status: "active",
        hasCertificate: false,
      });

      setTimeout(() => {
        router.push(`/dashboard/formateur/formations/participants/${id}`);
      }, 3000);
    } catch (err) {
      console.error("Error submitting user:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-left justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Ajouter un Participant
              </h1>
              <p className="text-gray-600">Formation ID: {id}</p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Nouveau Participant
              </h2>
              <p className="text-gray-600">
                Ajoutez un nouveau participant à cette formation
              </p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div className="space-y-5 w-full">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <UserIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Ex: Marie Dubois"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <MailIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="marie.dubois@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <KeyIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Minimum 6 caractères"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <PhoneIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Ex: +33 1 23 45 67 89"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <div className="relative">
                      <CheckCircleIcon
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasCertificate"
                    id="hasCertificate"
                    checked={formData.hasCertificate}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="hasCertificate"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Possède un certificat
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {submitLoading
                      ? "Ajout en cours..."
                      : "Ajouter le participant"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;

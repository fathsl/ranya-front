"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AwardIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  GraduationCapIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  RocketIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [telephone, setTelephone] = useState("");
  const [linkedInLink, setLinkedInLink] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [, setCvUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const checkPasswordStrength = (password: string | "") => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e: { target: { value: any } }) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleCvUpload = (file: File | null, documentUrl: string) => {
    setCvFile(file);
    setCvUrl(documentUrl);
  };

  const uploadCvToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("cv", file);

    const response = await fetch("/api/upload/cv", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement du CV");
    }

    const data = await response.json();
    return data.filename;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    setError("");

    try {
      let cvFileName = "";

      if (cvFile) {
        cvFileName = await uploadCvToServer(cvFile);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          telephone,
          password,
          role: "formateur",
          linkedInLink: linkedInLink || undefined,
          cv: cvFileName || undefined,
          isAccepted: false,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Inscription réussie:", data);
        router.push("/login");
      } else {
        setError(data.error || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      setError("Erreur lors de la tentative d'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-400";
    if (passwordStrength === 2) return "bg-yellow-400";
    if (passwordStrength === 3) return "bg-blue-400";
    if (passwordStrength === 4) return "bg-green-400";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Très faible";
    if (passwordStrength === 1) return "Faible";
    if (passwordStrength === 2) return "Moyen";
    if (passwordStrength === 3) return "Fort";
    if (passwordStrength === 4) return "Très fort";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex max-w-7xl w-full relative z-10">
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-purple-600 to-blue-700 rounded-l-3xl p-12 text-white flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="bg-white bg-opacity-20 p-3 rounded-2xl mr-4">
                <GraduationCapIcon size={32} />
              </div>
              <h1 className="text-3xl font-bold">EduLearn Pro</h1>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Commencez votre
              <span className="text-yellow-300"> voyage </span>
              d&apos;apprentissage
            </h2>

            <p className="text-lg mb-8 text-purple-100">
              Rejoignez notre communauté de plus de 50,000 apprenants passionnés
              et débloquez votre potentiel.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <RocketIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Démarrage Rapide</h3>
                  <p className="text-sm text-purple-100">
                    Accès immédiat à tous les cours
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <StarIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Contenu Premium</h3>
                  <p className="text-sm text-purple-100">
                    Cours créés par des experts
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <AwardIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Certifications</h3>
                  <p className="text-sm text-purple-100">
                    Diplômes reconnus mondialement
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white border-opacity-20">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">1000+</div>
                <div className="text-xs text-purple-100">Cours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">50k+</div>
                <div className="text-xs text-purple-100">Étudiants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">95%</div>
                <div className="text-xs text-purple-100">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="absolute top-10 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-20 w-8 h-8 bg-yellow-300 bg-opacity-30 rounded-full animate-pulse"></div>
        </div>

        <div className="w-full lg:w-3/5 bg-white lg:rounded-r-3xl shadow-2xl p-8 lg:p-12">
          <div className="max-w-lg mx-auto">
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-2xl mr-3">
                <GraduationCapIcon size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">EduLearn Pro</h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Créez votre compte
              </h2>
              <p className="text-gray-600">
                Commencez votre parcours d&apos;apprentissage dès
                aujourd&apos;hui
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2 animate-shake">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <MailIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                    size={20}
                  />
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <PhoneIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                    size={20}
                  />
                  <input
                    type="tel"
                    placeholder="+216 12 345 678"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien LinkedIn{" "}
                  <span className="text-gray-500 text-xs">(optionnel)</span>
                </label>
                <div className="relative">
                  <LinkIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                    size={20}
                  />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/votre-profil"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    value={linkedInLink}
                    onChange={(e) => setLinkedInLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <LockIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Créez un mot de passe fort"
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">
                        Force du mot de passe
                      </span>
                      <span
                        className={`font-medium ${
                          passwordStrength >= 3
                            ? "text-green-600"
                            : passwordStrength >= 2
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <LockIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                    size={20}
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-300 focus:ring-red-500"
                        : confirmPassword && password === confirmPassword
                        ? "border-green-300 focus:ring-green-500"
                        : "border-gray-300 focus:ring-purple-500"
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOffIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </button>
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircleIcon
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500"
                      size={20}
                    />
                  )}
                </div>
              </div>

              <DocumentUpload
                label="CV"
                onDocumentChange={handleCvUpload}
                accept=".pdf,.doc,.docx"
                className="mt-6"
              />

              {error && (
                <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  !name ||
                  !email ||
                  !telephone ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword
                }
                className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  loading ||
                  !name ||
                  !email ||
                  !telephone ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword
                    ? "opacity-70 cursor-not-allowed scale-100"
                    : "hover:from-purple-700 hover:to-blue-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Création du compte...</span>
                  </div>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Vous avez déjà un compte ?{" "}
                <a
                  href="/login"
                  className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
                >
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

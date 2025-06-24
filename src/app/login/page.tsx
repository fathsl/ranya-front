"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import AccessDeniedDialog from "@/components/AccessDeniedDialog";
import {
  AwardIcon,
  BookOpenIcon,
  EyeIcon,
  EyeOffIcon,
  GraduationCapIcon,
  LockIcon,
  MailIcon,
  UsersIcon,
} from "lucide-react";
import UpdateProfileDialog from "@/components/UpdateProfileDialog";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showUpdateProfileDialog, setShowUpdateProfileDialog] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: "",
    telephone: "",
    linkedInLink: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user && data.user.id) {
        if (data.user.role === "formateur" && data.user.isAccepted === false) {
          setShowAccessDenied(true);
          return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.user.token);
        setUser(data.user);
        console.log("user", user);

        if (data.user.role === "formateur") {
          router.push("/dashboard/formateur/dashboard");
        } else if (data.user.role === "participant") {
          setProfileData({
            name: data.user.name || "",
            telephone: data.user.telephone || "",
            linkedInLink: data.user.linkedInLink || "",
            password: "",
            confirmPassword: "",
          });
          setShowUpdateProfileDialog(true);

          // router.push("/dashboard/participant/dashboard");
        } else {
          router.push("/dashboard/formateur/dashboard");
        }
      } else {
        setError(data.error || "Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setError("Erreur lors de la tentative de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAccessDenied = () => {
    setShowAccessDenied(false);
    // Clear form fields
    setEmail("");
    setPassword("");
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        // Update localStorage and global state
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Redirect or close dialog
        setShowUpdateProfileDialog(false);
        router.push("/dashboard/participant/dashboard");
      } else {
        setError(data.message || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Impossible de mettre à jour le profil.");
    }
  };

  const skipProfileUpdate = () => {
    setShowUpdateProfileDialog(false);
    router.push("/dashboard/participant/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 size-72 bg-gradient-to-r from-green-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-10 -right-10 size-72 bg-gradient-to-r from-blue-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 size-72 bg-gradient-to-r from-teal-200 to-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex max-w-6xl w-full relative z-10">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-600 rounded-l-3xl p-12 text-white flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="bg-white bg-opacity-20 p-3 rounded-2xl mr-4">
                <GraduationCapIcon size={32} />
              </div>
              <h1 className="text-3xl font-bold">EduLearn Pro</h1>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Transformez votre
              <span className="text-green-300"> avenir </span>
              avec l&apos;apprentissage
            </h2>

            <p className="text-lg mb-8 text-green-100">
              Rejoignez plus de 50,000 étudiants qui développent leurs
              compétences avec nos cours expertement conçus.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <BookOpenIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">1000+ Cours</h3>
                  <p className="text-sm text-green-100">
                    Dans tous les domaines
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <UsersIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Experts Certifiés</h3>
                  <p className="text-sm text-green-100">
                    Instructeurs de qualité
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <AwardIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Certificats Reconnus</h3>
                  <p className="text-sm text-green-100">Valorisez votre CV</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-10 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-20 w-8 h-8 bg-green-300 bg-opacity-30 rounded-full animate-pulse"></div>
        </div>

        <div className="w-full lg:w-1/2 bg-white lg:rounded-r-3xl shadow-2xl p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-2xl mr-3">
                <GraduationCapIcon size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                EduLearn Pro
              </h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Bon retour !
              </h2>
              <p className="text-gray-600">
                Connectez-vous pour continuer votre apprentissage
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2 animate-shake">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <MailIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
                    size={20}
                  />
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <LockIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Se souvenir de moi
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  loading
                    ? "opacity-70 cursor-not-allowed scale-100"
                    : "hover:from-green-700 hover:to-blue-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Pas encore de compte ?{" "}
                <a
                  href="/register"
                  className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold hover:underline transition-colors"
                >
                  Créer un compte
                </a>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Compte de démonstration: demo@example.com / demo123
              </p>
            </div>
          </div>
        </div>
        <UpdateProfileDialog
          isOpen={showUpdateProfileDialog}
          onClose={skipProfileUpdate}
          onSubmit={handleUpdateProfile}
          currentUser={user}
          loading={loading}
        />
        <AccessDeniedDialog
          isOpen={showAccessDenied}
          onClose={handleCloseAccessDenied}
        />
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

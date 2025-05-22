"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "formateur",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-orange-50 via-white to-purple-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-6">
          Créez un utilisateur ✨
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <FaUser />
            </span>
            <input
              type="text"
              placeholder="Nom complet"
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <FaEnvelope />
            </span>
            <input
              type="email"
              placeholder="Email"
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <FaLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>

          {/* Confirmer le mot de passe */}
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <FaLock />
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>

          {/* Message d'erreur */}
          {error && (
            <p className="text-red-600 text-sm font-medium text-center">
              {error}
            </p>
          )}

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-xl font-semibold shadow-md hover:opacity-90 transition duration-200"
          >
            S&apos;inscrire
          </button>
        </form>

        {/* Lien vers page de connexion */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Vous avez déjà un compte ?{" "}
          <a
            href="/login"
            className="text-orange-600 hover:underline font-medium"
          >
            Connectez-vous
          </a>
        </p>
      </div>
    </div>
  );
}

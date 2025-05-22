"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useAuth } from "@/contexts/authContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

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
        localStorage.setItem("user", JSON.stringify(data.user));

        localStorage.setItem("token", data.user.token);
        setUser(data.user);
        console.log("user", user);

        if (data.user.role === "formateur") {
          router.push("/dashboard/formateur");
        } else if (data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/participant");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-orange-50 via-white to-purple-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-6">
          Connexion 🔐
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <FaLock />
            </span>
            <input
              type="password"
              placeholder="Mot de passe"
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Pas encore de compte ?{" "}
          <a
            href="/register"
            className="text-orange-600 hover:underline font-medium"
          >
            Créez-en un
          </a>
        </p>
      </div>
    </div>
  );
}

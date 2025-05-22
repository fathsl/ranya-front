"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-br from-orange-100 to-orange-300">
        <h1 className="text-5xl font-extrabold mb-4">
          Bienvenue sur <span className="text-orange-600">FormaBoost</span> 🎓
        </h1>
        <p className="text-lg text-gray-700 mb-6 max-w-xl">
          La plateforme de formation moderne pour apprendre, progresser, et
          valider vos compétences à votre rythme.
        </p>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0  space-x-0 md:space-x-4 justify-between items-center">
          <Link href="/login">
            <button className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition">
              Se connecter
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-3 bg-white text-orange-600 border border-orange-600 rounded-xl hover:bg-orange-100 transition">
              S&apos;inscrire
            </button>
          </Link>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">
          Pourquoi choisir FormaBoost ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-xl mb-2">Formateurs certifiés</h3>
            <p>Des experts passionnés qui vous accompagnent à chaque étape.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-xl mb-2">Contenu interactif</h3>
            <p>
              Modules dynamiques, QCMs intelligents, et certification
              automatique.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-xl mb-2">Suivi personnalisé</h3>
            <p>Tableaux de bord, rappels intelligents, et progrès visible.</p>
          </div>
        </div>
      </section>

      {/* Formations populaires */}
      <section className="py-16 px-6 bg-orange-50">
        <h2 className="text-3xl font-bold text-center mb-10">
          Formations populaires
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            "Développement Web",
            "Cybersécurité",
            "Leadership & Communication",
          ].map((course, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg mb-2">{course}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Explorez les compétences clés dans ce domaine à votre rythme.
              </p>
              <button className="text-orange-600 font-medium hover:underline">
                En savoir plus →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-900 text-gray-100 text-center">
        <p className="mb-4">&copy; 2025 FormaBoost. Tous droits réservés.</p>
        <div className="flex justify-center space-x-6">
          <Link href="/about" className="hover:underline">
            À propos
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/privacy" className="hover:underline">
            Confidentialité
          </Link>
        </div>
      </footer>
    </main>
  );
}

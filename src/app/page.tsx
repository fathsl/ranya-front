"use client";

import LangSelector from "@/components/LangSelector";
import {
  ArrowRightIcon,
  AwardIcon,
  BrainIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  GlobeIcon,
  GraduationCapIcon,
  MenuIcon,
  PlayIcon,
  StarsIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import m from "../../lang";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white/90 backdrop-blur-md fixed w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                <GraduationCapIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                FormaBoost
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#courses"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                Formations
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                À propos
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                Contact
              </a>
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <button className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors">
                    Se Connecter
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 font-medium transition-all transform hover:scale-105">
                    S&apos;inscrire
                  </button>
                </Link>
              </div>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#courses"
                className="block text-gray-700 hover:text-orange-600 font-medium"
              >
                Formations
              </a>
              <a
                href="#about"
                className="block text-gray-700 hover:text-orange-600 font-medium"
              >
                À propos
              </a>
              <a
                href="#contact"
                className="block text-gray-700 hover:text-orange-600 font-medium"
              >
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <button className="px-4 py-2 text-orange-600 font-medium text-left">
                  Se connecter
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium">
                  S&apos;inscrire
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="pt-20 pb-16 bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <ZapIcon className="h-4 w-4 mr-2" />
                Nouveau : IA intégrée pour un apprentissage personnalisé
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transformez votre
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {" "}
                  carrière{" "}
                </span>
                avec FormaBoost
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Rejoignez plus de 50,000 professionnels qui développent leurs
                compétences avec nos formations certifiées. Apprentissage
                flexible, suivi personnalisé, résultats garantis.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 flex items-center justify-center">
                  Commencer gratuitement
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
                <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold text-lg hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center">
                  <PlayIcon className="mr-2 h-5 w-5" />
                  voir la démo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Accès immédiat
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Certificats reconnus
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />7
                  jours d&apos;essai
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Votre progression</h3>
                    <TrendingUpIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Développement Web</span>
                      <span className="font-bold">87%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full w-[87%]"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium">React Avancé</span>
                    </div>
                    <span className="text-green-600 font-semibold">
                      Terminé
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <PlayIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <span className="font-medium">Node.js & API</span>
                    </div>
                    <span className="text-orange-600 font-semibold">
                      En cours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                50K+
              </div>
              <div className="text-gray-600">Étudiants actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Formations disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Taux de satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                200+
              </div>
              <div className="text-gray-600">Formateurs experts</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir FormaBoost ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience d&apos;apprentissage révolutionnaire conçue pour
              votre réussite professionnelle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Formateurs certifiés
              </h3>
              <p className="text-gray-600 mb-6">
                Apprenez auprès d&apos;experts reconnus dans leur domaine. Nos
                formateurs sont sélectionnés pour leur expertise et leur passion
                pour l&apos;enseignement.
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                Découvrir nos experts
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                IA & Personnalisation
              </h3>
              <p className="text-gray-600 mb-6">
                Notre intelligence artificielle adapte le contenu à votre rythme
                et style d&apos;apprentissage pour optimiser votre progression.
              </p>
              <div className="flex items-center text-green-600 font-semibold">
                En savoir plus
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AwardIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Certifications reconnues
              </h3>
              <p className="text-gray-600 mb-6">
                Obtenez des certifications valorisées par les employeurs et
                reconnues dans l&apos;industrie pour booster votre carrière.
              </p>
              <div className="flex items-center text-purple-600 font-semibold">
                Voir les certifications
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Formations les plus populaires
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez nos formations les plus demandées par les professionnels
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Développement Web Full-Stack",
                description:
                  "Maîtrisez React, Node.js, et les technologies modernes du web",
                students: "12,450",
                rating: 4.9,
                duration: "8 semaines",
                level: "Intermédiaire",
                image: "🚀",
              },
              {
                title: "Cybersécurité & Ethical Hacking",
                description:
                  "Protégez les systèmes et apprenez les techniques de sécurité avancées",
                students: "8,920",
                rating: 4.8,
                duration: "12 semaines",
                level: "Avancé",
                image: "🔒",
              },
              {
                title: "Leadership & Management",
                description:
                  "Développez vos compétences de leadership et de gestion d'équipe",
                students: "15,670",
                rating: 4.9,
                duration: "6 semaines",
                level: "Tous niveaux",
                image: "👑",
              },
            ].map((course, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-orange-500 hover:shadow-xl transition-all group"
              >
                <div className="p-8">
                  <div className="text-4xl mb-4">{course.image}</div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {course.level}
                    </span>
                    <div className="flex items-center">
                      <StarsIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span>{course.students} étudiants</span>
                    <span>{course.duration}</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all group-hover:scale-105">
                    Découvrir la formation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à transformer votre carrière ?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui ont déjà fait le choix
            de l&apos;excellence avec FormaBoost
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-orange-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105">
              Commencer gratuitement
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all">
              Parler à un conseiller
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                  <GraduationCapIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  FormaBoost
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                La plateforme de formation qui transforme votre avenir
                professionnel.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <LangSelector />
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <GlobeIcon className="h-5 w-5" />
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer">
                  <UsersIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Formations</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Développement Web
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Cybersécurité
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Data Science
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Leadership
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Centre d&apos;aide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Communauté
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    À propos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Carrières
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Presse
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Partenaires
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 FormaBoost. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Confidentialité
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Conditions
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>

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

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

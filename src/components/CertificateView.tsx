import {
  AwardIcon,
  BookIcon,
  CalendarIcon,
  DownloadIcon,
  ShieldIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

const CertificateViewModal = ({
  certificateId,
  isOpen,
  onClose,
  certificates,
  handleDownload,
}) => {
  const certificate = certificates.find(
    (cert: { id: undefined }) => cert.id === certificateId
  );

  if (!isOpen || !certificate) return null;

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <AwardIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Détails du Certificat
              </h2>
              <p className="text-sm text-gray-500">
                Informations en lecture seule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <ShieldIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800">
                  CERTIFICAT DE FORMATION
                </h3>
                <div className="w-24 h-1 bg-yellow-400 mx-auto mt-2 rounded"></div>
              </div>
              <p className="text-gray-600">
                Nous certifions par les présentes que
              </p>
              <p className="text-3xl font-bold text-green-700">
                {certificate.nomParticipant}
              </p>
              <p className="text-gray-600">
                a terminé avec succès la formation
              </p>
              <p className="text-xl font-semibold text-blue-700">
                {certificate.formationEntity?.titre || certificate.formation}
              </p>
              {certificate.formationEntity?.domaine && (
                <div className="inline-block">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
                    {certificate.formationEntity.domaine.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Certificate Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Participant Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                Informations du Participant
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Nom complet
                  </label>
                  <p className="text-gray-900 font-medium">
                    {certificate.nomParticipant}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    ID Certificat
                  </label>
                  <p className="text-gray-900 font-mono text-sm">
                    {certificate.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookIcon className="w-5 h-5 text-green-600" />
                Informations de la Formation
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Titre
                  </label>
                  <p className="text-gray-900 font-medium">
                    {certificate.formationEntity?.titre ||
                      certificate.formation}
                  </p>
                </div>
                {certificate.formationEntity?.domaine && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Domaine
                    </label>
                    <p className="text-gray-900">
                      {certificate.formationEntity.domaine}
                    </p>
                  </div>
                )}
                {certificate.formationEntity?.duree && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Durée
                    </label>
                    <p className="text-gray-900">
                      {certificate.formationEntity.duree}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formateur Information */}
          {certificate.formationEntity?.formateur && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-purple-600" />
                Informations du Formateur
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Nom
                    </label>
                    <p className="text-gray-900 font-medium">
                      {certificate.formationEntity.formateur.nom}
                    </p>
                  </div>
                  {certificate.formationEntity.formateur.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {certificate.formationEntity.formateur.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Formation Description */}
          {certificate.formationEntity?.description && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Description de la Formation
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {certificate.formationEntity.description}
                </p>
              </div>
            </div>
          )}

          {/* Date Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              Informations de Date
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Date d&apos;obtention
                </label>
                <p className="text-gray-900 font-medium">
                  {formatDate(certificate.dateObtention)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Certificat généré automatiquement • Lecture seule
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                handleDownload(
                  certificate.id,
                  certificate.formationEntity?.titre || certificate.formation
                )
              }
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewModal;

import {
  EyeIcon,
  EyeOffIcon,
  LinkIcon,
  LockIcon,
  PhoneIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

const UpdateProfileDialog = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    telephone: currentUser?.telephone || "",
    linkedInLink: currentUser?.linkedInLink || "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData((prev) => ({ ...prev, password: newPassword }));
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Faible";
    if (passwordStrength <= 2) return "Moyen";
    if (passwordStrength <= 3) return "Fort";
    return "Très fort";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-yellow-500";
    if (passwordStrength <= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      // Show error message
      return;
    }

    const submitData = {
      name: formData.name,
      telephone: formData.telephone,
      linkedInLink: formData.linkedInLink,
      ...(formData.password && { password: formData.password }),
    };

    onSubmit(submitData); // This calls handleUpdateProfile
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Mettre à jour votre profil
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XIcon size={24} />
            </button>
          </div>

          <div className="space-y-5">
            {/* Name Field */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <UserIcon
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <PhoneIcon
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  size={20}
                />
                <input
                  type="tel"
                  placeholder="+216 12 345 678"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      telephone: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            {/* LinkedIn Field */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien LinkedIn{" "}
                <span className="text-gray-500 text-xs">(optionnel)</span>
              </label>
              <div className="relative">
                <LinkIcon
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  size={20}
                />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/votre-profil"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  value={formData.linkedInLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedInLink: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Ignorer
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !formData.name ||
                  !formData.telephone ||
                  (formData.password &&
                    formData.password !== formData.confirmPassword)
                }
                className={`flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                  loading ||
                  !formData.name ||
                  !formData.telephone ||
                  (formData.password &&
                    formData.password !== formData.confirmPassword)
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:from-blue-700 hover:to-green-700 transform hover:scale-105"
                }`}
              >
                {loading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileDialog;

import {
  EvaluationTest,
  Question,
} from "@/app/dashboard/formateur/ressources/page";
import { PlusIcon, SaveIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import QuestionEditor from "./QuestionEditor";

const EditTestDrawer = ({
  isOpen,
  onClose,
  test,
  formationId,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  test: EvaluationTest | null;
  formationId: string | null;
  onSave: (testData: Partial<EvaluationTest>) => void;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
    isEnabled: true,
    questions: [] as Question[],
  });

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title,
        description: test.description,
        timeLimit: test.timeLimit,
        passingScore: test.passingScore,
        isEnabled: test.isEnabled,
        questions: test.questions || [],
      });
    } else {
      setFormData({
        title: "Test d'évaluation",
        description: "",
        timeLimit: 30,
        passingScore: 70,
        isEnabled: true,
        questions: [],
      });
    }
  }, [test]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
      order: formData.questions.length + 1,
      formationId: formationId || "",
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? updatedQuestion : q
      ),
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      formationId: formationId || "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {test ? "Modifier le test" : "Créer un test d'évaluation"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Test Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">
              Configuration du test
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du test
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titre du test"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Description du test"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timeLimit: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score de réussite (%)
                </label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passingScore: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isEnabled: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Test activé
                </span>
              </label>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Questions</h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusIcon size={16} />
                Ajouter une question
              </button>
            </div>

            {formData.questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                onUpdate={(updatedQuestion) =>
                  updateQuestion(index, updatedQuestion)
                }
                onRemove={() => removeQuestion(index)}
              />
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <SaveIcon size={16} />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTestDrawer;

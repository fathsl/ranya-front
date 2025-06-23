import { Question } from "@/app/dashboard/formateur/ressources/page";
import { TrashIcon } from "lucide-react";

const QuestionEditor = ({
  question,
  index,
  onUpdate,
  onRemove,
}: {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onRemove: () => void;
}) => {
  const updateQuestion = (field: keyof Question, value: any) => {
    onUpdate({ ...question, [field]: value });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:text-red-700 transition-colors"
        >
          <TrashIcon size={16} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de question
        </label>
        <select
          value={question.type}
          onChange={(e) => updateQuestion("type", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="multiple-choice">Choix multiple</option>
          <option value="true-false">Vrai/Faux</option>
          <option value="short-answer">Réponse courte</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question
        </label>
        <textarea
          value={question.question}
          onChange={(e) => updateQuestion("question", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Posez votre question..."
        />
      </div>

      {/* Options for multiple choice and true/false */}
      {(question.type === "multiple-choice" ||
        question.type === "true-false") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options de réponse
          </label>
          {question.type === "multiple-choice" && (
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === option}
                    onChange={() => updateQuestion("correctAnswer", option)}
                    className="text-blue-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[optionIndex] = e.target.value;
                      updateQuestion("options", newOptions);
                      if (question.correctAnswer === option) {
                        updateQuestion("correctAnswer", e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                </div>
              ))}
            </div>
          )}

          {question.type === "true-false" && (
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correctAnswer === "true"}
                  onChange={() => updateQuestion("correctAnswer", "true")}
                  className="mr-2 text-blue-500"
                />
                <span>Vrai</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correctAnswer === "false"}
                  onChange={() => updateQuestion("correctAnswer", "false")}
                  className="mr-2 text-blue-500"
                />
                <span>Faux</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Correct answer for short answer */}
      {question.type === "short-answer" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Réponse correcte
          </label>
          <input
            type="text"
            value={question.correctAnswer}
            onChange={(e) => updateQuestion("correctAnswer", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Réponse attendue"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points
          </label>
          <input
            type="number"
            value={question.points}
            onChange={(e) => updateQuestion("points", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordre
          </label>
          <input
            type="number"
            value={question.order}
            onChange={(e) => updateQuestion("order", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explication (optionnel)
        </label>
        <textarea
          value={question.explanation || ""}
          onChange={(e) => updateQuestion("explanation", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Explication de la réponse correcte..."
        />
      </div>
    </div>
  );
};

export default QuestionEditor;

import React, { useState } from 'react';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface QCMFormProps {
  onQCMChange: (qcm: Question[]) => void;
}

const QCMForm: React.FC<QCMFormProps> = ({ onQCMChange }) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = { question: '', options: ['', '', '', ''], answer: '' };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    onQCMChange(updatedQuestions);
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = questions.map((q, i) => (i === index ? updatedQuestion : q));
    setQuestions(updatedQuestions);
    onQCMChange(updatedQuestions);
  };

  return (
    <div className="qcm-form">
      <h4 className="text-lg font-medium">Ajouter des questions</h4>
      {questions.map((q, index) => (
        <div key={index} className="question">
          <input
            type="text"
            value={q.question}
            onChange={(e) => {
              const updatedQuestion = { ...q, question: e.target.value };
              updateQuestion(index, updatedQuestion);
            }}
            placeholder="Intitulé de la question"
            className="w-full p-2 border rounded"
          />
          {q.options.map((option, optIndex) => (
            <input
              key={optIndex}
              type="text"
              value={option}
              onChange={(e) => {
                const updatedOptions = q.options.map((opt, i) =>
                  i === optIndex ? e.target.value : opt
                );
                const updatedQuestion = { ...q, options: updatedOptions };
                updateQuestion(index, updatedQuestion);
              }}
              placeholder={`Option ${optIndex + 1}`}
              className="w-full p-2 border rounded"
            />
          ))}
          <input
            type="text"
            value={q.answer}
            onChange={(e) => {
              const updatedQuestion = { ...q, answer: e.target.value };
              updateQuestion(index, updatedQuestion);
            }}
            placeholder="Réponse correcte"
            className="w-full p-2 border rounded"
          />
        </div>
      ))}
      <button onClick={addQuestion} className="bg-green-600 text-white px-4 py-2 rounded">
        Ajouter une question
      </button>
    </div>
  );
};

export default QCMForm;

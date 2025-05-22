export const TimelineStepper = ({
  currentStep,
  onStepClick,
  totalSteps = 4,
}) => {
  const steps = [
    {
      id: 1,
      title: "Informations générales",
    },
    {
      id: 2,
      title: "Contenu détaillé",
    },
    { id: 3, title: "Configuration" },
    { id: 4, title: "Publication" },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((stepItem) => {
          const isCompleted = currentStep > stepItem.id;
          const isCurrent = currentStep === stepItem.id;

          return (
            <div
              key={stepItem.id}
              className="flex flex-col items-center z-10 cursor-pointer"
              onClick={() => onStepClick(stepItem.id)}
              style={{ width: `${100 / totalSteps}%` }}
            >
              <div
                className={`
              w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
              ${
                isCompleted
                  ? "bg-gray-400"
                  : isCurrent
                  ? "bg-orange-500 border-2 border-white"
                  : "bg-gray-300 group-hover:bg-gray-400"
              }
            `}
              >
                {stepItem.id}
              </div>

              <div className="text-center">
                <h3
                  className={`
                text-sm font-medium
                ${
                  isCurrent
                    ? "text-orange-600"
                    : isCompleted
                    ? "text-gray-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }
              `}
                >
                  {stepItem.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

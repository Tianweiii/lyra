interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

export const ProgressBar = ({ currentStep, steps }: ProgressBarProps) => {
  return (
    <div className="flex items-center">
      {steps.map((label, index) => (
        <div key={index} className="flex flex-col items-center flex-1 relative">
          {/* Step dot */}
          <div
            className={`w-6 h-6 rounded-full z-10 flex items-center justify-center 
              ${index + 1 <= currentStep ? "bg-blue-500" : "bg-gray-700"}`}
          >
            {index + 1 <= currentStep && <div className="w-3 h-3 bg-white rounded-full"></div>}
          </div>

          {/* Step label */}
          <div className={`text-xs mt-2 ${index + 1 <= currentStep ? "text-white" : "text-gray-500"}`}>{label}</div>

          {index < steps.length - 1 && (
            <div
              className={`absolute top-2 left-1/2 w-full h-0.5 ${index + 1 < currentStep ? "bg-blue-500" : "bg-gray-700"}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

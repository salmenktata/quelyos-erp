import { CheckCircle } from 'lucide-react'

interface Step {
  id: number
  title: string
}

interface WizardStepperProps {
  steps: Step[]
  currentStep: number
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <li key={step.id} className="relative flex-1">
            {idx !== 0 && (
              <div
                className="absolute left-0 top-4 -ml-px h-0.5 w-full bg-gray-300 dark:bg-gray-600"
                aria-hidden="true"
              />
            )}

            <div className="relative flex items-center group">
              <span
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full transition-all
                  ${
                    step.id < currentStep
                      ? 'bg-teal-600 dark:bg-teal-500'
                      : step.id === currentStep
                        ? 'bg-teal-600 dark:bg-teal-500 ring-4 ring-teal-100 dark:ring-teal-900'
                        : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-white font-medium">{step.id}</span>
                )}
              </span>

              <span
                className={`ml-3 text-sm font-medium ${
                  step.id <= currentStep
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}

import { useInstallWizard } from '@/hooks/useInstallWizard'
import { WizardStepper } from './WizardStepper'
import {
  Step1TenantInfo,
  Step2PlanSelection,
  Step3SeedConfig,
  Step4Validation,
  Step5Progress,
} from './steps'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Informations' },
  { id: 2, title: 'Plan' },
  { id: 3, title: 'Données' },
  { id: 4, title: 'Validation' },
  { id: 5, title: 'Installation' },
]

export function InstallWizard() {
  const { currentStep, config, updateConfig, nextStep, prevStep, validateCurrentStep } =
    useInstallWizard()

  const isLastConfigStep = currentStep === 4
  const isFirstStep = currentStep === 1
  const canProceed = validateCurrentStep()

  return (
    <div className="max-w-5xl mx-auto">
      {/* Stepper */}
      <WizardStepper steps={STEPS} currentStep={currentStep} />

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        {currentStep === 1 && <Step1TenantInfo config={config} updateConfig={updateConfig} />}
        {currentStep === 2 && <Step2PlanSelection config={config} updateConfig={updateConfig} />}
        {currentStep === 3 && <Step3SeedConfig config={config} updateConfig={updateConfig} />}
        {currentStep === 4 && <Step4Validation config={config} />}
        {currentStep === 5 && <Step5Progress config={config} />}
      </div>

      {/* Navigation buttons (cachés sur step 5) */}
      {currentStep < 5 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${
                isFirstStep
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white'
              }
            `}
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </button>

          {isLastConfigStep ? (
            <button
              onClick={nextStep}
              disabled={!canProceed}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg transition-colors
                ${
                  canProceed
                    ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <Play className="h-4 w-4" />
              Lancer l&apos;installation
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${
                  canProceed
                    ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

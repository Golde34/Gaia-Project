import { useState } from "react"
import StepProgress from "../../components/template/StepProgress"
import GaiaIntroduction from "./GaiaIntroduction"
import { Button } from "@tremor/react"
import { cx } from "../../kernels/utils/cx"
import useScroll from "../../kernels/utils/userScroll"
import LogoIcon from "../../components/icons/LogoIcon"
import CalendarRegistration from "./CalendarRegisgtration"

const steps = [
  { id: 1, screenLabel: "Gaia Introduction" },
  { id: 2, screenLabel: "Gaia CalendarSetup" },
  { id: 3, screenLabel: "Gaia Task Registration" },
]

const StepContent = ({ stepIndex, onPrevious, onNext, onSkip }) => {
  switch (stepIndex) {
    case 1:
      return (
        <div className="mx-auto mb-20 mt-28 max-w-7xl px-4 md:mt-32 md:px-6">
          <GaiaIntroduction onNext={onNext} onSkip={onSkip} />
        </div>
      )
    case 2:
      return (
        <div className="mx-auto mb-20 mt-28 max-w-8xl px-4 md:mt-32 md:px-6">
          <CalendarRegistration onNext={onNext} onSkip={onSkip} onPrevious={onPrevious} />
        </div >
      )
    case 3:
      return (
        <div>
          <h2>Gaia Task Registration</h2>
          <p>Register your tasks here...</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={onSkip} variant="secondary">Skip</Button>
            <Button onClick={onNext}>Finish</Button>
          </div>
        </div>
      )
    default:
      return <p>Onboarding complete!</p>
  }
}

const Onboarding = () => {
  const scrolled = useScroll(13)
  const [stepIndex, setStepIndex] = useState(1)

  const handleNext = () => {
    if (stepIndex < steps.length) setStepIndex(stepIndex + 1)
    else window.location.href = "/dashboard"
  }

  const handleSkip = () => {
    window.location.href = "/dashboard"
  }

  const handlePrevious = () => {
    if (stepIndex > 1) setStepIndex(stepIndex - 1)
  }

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 isolate z-50 flex items-center justify-between border-b border-gray-200 px-4 transition-all md:grid md:grid-cols-[200px_auto_200px] md:px-6 dark:border-gray-900 dark:bg-gray-925",
          scrolled ? "h-12" : "h-20",
        )}
      >
        <div
          className="hidden flex-nowrap items-center gap-0.5 md:flex"
          aria-hidden="true"
        >
          <LogoIcon
            className="w-7 p-px text-blue-500 dark:text-blue-500"
            aria-hidden="true"
          />
          <span className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-gray-50">
            Gaia Onboarding
          </span>
        </div>
        <StepProgress currentStepIndex={stepIndex - 1} />
        <a href="/client-gui/dashboard">
          <Button
            variant="secondary"
            className="hidden md:inline-flex"
          > Skip to Dashboard
          </Button>
        </a>
      </header>
      <main className={cx(scrolled && "pt-12")}>
        <StepContent stepIndex={stepIndex} onNext={handleNext} onSkip={handleSkip} onPrevious={handlePrevious} />
      </main >
    </>
  )
}

export default Onboarding

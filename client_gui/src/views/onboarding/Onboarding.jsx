// components/onboarding/Onboarding.jsx
import React, { useState } from "react"
import StepProgress from "../../components/template/StepProgress"
import GaiaIntroduction from "./GaiaIntroduction"

const steps = [
  { id: 1, screenLabel: "Gaia Introduction" },
  { id: 2, screenLabel: "Gaia CalendarSetup" },
  { id: 3, screenLabel: "Gaia Task Registration" },
]

const StepContent = ({ stepIndex, onNext, onSkip }) => {
  switch (stepIndex) {
    case 1:
      return (
        <>
          <GaiaIntroduction onNext={onNext} onSkip={onSkip} />
        </>
      ) 
    case 2:
      return (
        <div>
          <h2>Gaia Calendar Setup</h2>
          <p>Here you setup your calendar integration...</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={onSkip} variant="secondary">Skip</Button>
            <Button onClick={onNext}>Continue</Button>
          </div>
        </div>
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
  const [stepIndex, setStepIndex] = useState(1)

  const handleNext = () => {
    if (stepIndex < steps.length) setStepIndex(stepIndex + 1)
    else window.location.href = "/dashboard"
  }

  const handleSkip = () => {
    window.location.href = "/dashboard"
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <StepProgress currentStepIndex={stepIndex - 1} /> 
      <StepContent stepIndex={stepIndex} onNext={handleNext} onSkip={handleSkip} />
    </div>
  )
}

export default Onboarding

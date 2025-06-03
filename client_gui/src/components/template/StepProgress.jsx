import { cx } from "../../kernels/utils/cx"

const steps = [
  { id: 1, screenLabel: "Gaia Introduction" },
  { id: 2, screenLabel: "Gaia CalendarSetup" },
  { id: 3, screenLabel: "Gaia Task Registration" },
]

const StepProgress = ({ currentStepIndex }) => {
  return (
    <div aria-label="Onboarding progress">
      <ol className="mx-auto flex w-24 flex-nowrap gap-1 md:w-fit">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cx(
              "h-1 w-12 rounded-full",
              index === currentStepIndex
                ? "bg-blue-500"
                : "bg-gray-300 dark:bg-gray-700",
            )}
          >
            <span className="sr-only">
              {step.screenLabel}{" "}
              {index < currentStepIndex
                ? "completed"
                : index === currentStepIndex
                ? "current"
                : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default StepProgress

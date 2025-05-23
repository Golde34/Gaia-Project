import { useLocation } from "react-router-dom";
import { cx } from "../../kernels/utils/cx";
import useScroll from "../../kernels/utils/userScroll";
import { LoginIcon } from "@heroicons/react/outline";
import { Button } from "@tremor/react";
import Signup from "../../screens/onboardingScreen/Signup";
import TaskRegistration from "../task_manager/TaskRegistration";
import OnboardingUserInfo from "../../screens/onboardingScreen/OnboardingUserInfo";

const steps = [
  { name: "Sign Up", href: "client-gui/onboarding/signup" },
  { name: "Task Registration", href: "client-gui/user-task-connector" },
];

const stepComponents = {
  "client-gui/onboarding/signup": <Signup />,
  "client-gui/onboardinf/user-information": <OnboardingUserInfo />,
  "client-gui/user-task-connector": <TaskRegistration />,
};

const StepProgress = ({ steps }) => {
  const { pathname } = useLocation();

  const currentStepIndex = steps.findIndex((step) =>
    pathname.startsWith(`/${step.href}`)
  );

  const safeStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div aria-label="Onboarding progress">
      <ol className="mx-auto flex w-24 flex-nowrap gap-1 md:w-fit">
        {steps.map((step, index) => (
          <li
            key={step.name}
            className={cx(
              "h-1 w-12 rounded-full",
              index <= safeStepIndex
                ? "bg-blue-500"
                : "bg-gray-300 dark:bg-gray-700"
            )}
          >
            <span className="sr-only">
              {step.name}{" "}
              {index < safeStepIndex
                ? "completed"
                : index === safeStepIndex
                ? "current"
                : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

const Onboarding = () => {
  const scrolled = useScroll(15);
  const { pathname } = useLocation();

  const currentStepIndex = steps.findIndex((step) =>
    pathname.startsWith(`/${step.href}`)
  );

  const safeStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  const currentStepComponent = stepComponents[steps[safeStepIndex].href];

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 isolate z-50 flex items-center justify-between border-b px-4 transition-all md:grid md:grid-cols-[200px_auto_200px] md:px-6",
          scrolled ? "h-12" : "h-20"
        )}
      >
        <div
          className="hidden flex-nowrap items-center gap-0.5 md:flex"
          aria-hidden="true"
        >
          <LoginIcon
            className="w-7 p-px text-blue-500 dark:text-blue-500"
            aria-hidden="true"
          />
          <span className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-gray-50">
            Gaia 
          </span>
        </div>
        <StepProgress steps={steps} />
        <Button className="ml-auto w-fit" asChild>
          <a href="/client-gui/dashboard">Skip to dashboard</a>
        </Button>
      </header>
      <div
        className="mx-auto mb-20 mt-28 px-6"
        tabIndex={-1}
        aria-live="polite"
      >
        {currentStepComponent}
      </div>
    </>
  );
};

export default Onboarding;

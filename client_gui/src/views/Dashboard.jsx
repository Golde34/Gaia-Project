import LeftColumn from "./LeftColumn"
import Template from "../components/template/Template"
import RightColumn from "./RightColumn"
import { useDispatch, useSelector } from "react-redux"
import { useCallback, useEffect, useRef } from "react";
import { getOnboarding } from "../api/store/actions/middleware_loader/microservices.actions";
import { useNavigate } from "react-router-dom";

function ContentArea() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onboarding = useSelector((state) => state.onboarding);
  const { loading, error, onboarding: onboardingData } = onboarding;
  const didOnboardingRef = useRef();
  const getOnboardingCallback = useCallback(() => {
    dispatch(getOnboarding());
  }, [dispatch]);

  useEffect(() => {
    if (didOnboardingRef.current) return;
    getOnboardingCallback();
    didOnboardingRef.current = true;
  }, [getOnboardingCallback]);

  useEffect(() => {
    console.log("Onboarding data:", onboardingData);
    if (!loading && !error && onboardingData) {
      navigate("/onboarding");
    }
  }, [loading, error, onboardingData, navigate]);

  if (loading) {
    return <p>Loading…</p>;
  }

  if (error) {
    return <p>Error loading onboarding data.</p>;
  }

  return (
    <div className="grid md:grid-cols-3 grid-cols-1 w-full">
      <div className="col-span-2">
        <LeftColumn />
      </div>
      <div className="w-full">
        <RightColumn />
      </div>
    </div>
  );
}

const Dashboard = () => {
  return (
    <Template>
      <ContentArea />
    </Template>
  )
}

export default Dashboard;


import { useState } from "react";
import Home from "./pages/Home";
import LandingHero from "./components/LandingHero";

export default function App() {
  const [currentView, setCurrentView] = useState("landing");
  return (
    <>
      {currentView === "landing" ? (
        <LandingHero onLaunch={() => setCurrentView("dashboard")} />
      ) : (
        <Home />
      )}
    </>
  );
}
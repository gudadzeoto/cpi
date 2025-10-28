import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/footer";
import ErrorBoundary from "./components/ErrorBoundary";
import SoundManager from "./components/SoundManager";
import "./App.scss";

function App() {
  const [language, setLanguage] = useState("GE");
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <ErrorBoundary language={language}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="w-full flex justify-center bg-gray-50">
          <div className="w-full max-w-[1200px] px-4 md:px-8">
            <Header language={language} setLanguage={setLanguage} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />

          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1200px] px-4 md:px-8">
            <Main language={language} setLanguage={setLanguage} soundEnabled={soundEnabled} />
          </div>
        </div>
        <Footer language={language} setLanguage={setLanguage}></Footer>
        <SoundManager soundEnabled={soundEnabled} language={language} />
      </div>

    </ErrorBoundary>
  );
}

export default App;

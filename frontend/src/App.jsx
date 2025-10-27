import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/footer";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.scss";

function App() {
  const [language, setLanguage] = useState("GE");

  return (
    <ErrorBoundary language={language}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header სექცია */}
        <div className="w-full flex justify-center bg-gray-50">
          <div className="w-full max-w-[1200px] px-4 md:px-8">
            <Header language={language} setLanguage={setLanguage} />
          </div>
        </div>

        {/* Main სექცია */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1200px] px-4 md:px-8">
            <Main language={language} setLanguage={setLanguage} />
          </div>
        </div>
        <Footer language={language} setLanguage={setLanguage}></Footer>
      </div>

    </ErrorBoundary>
  );
}

export default App;

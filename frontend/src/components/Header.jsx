import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import sakstatLogoGe from "../assets/images/sakstat-logo.svg";
import sakstatLogoEn from "../assets/images/sakstat-logo-en.png";
import georgianFlag from "../assets/images/georgian-flag.svg";
import britishFlag from "../assets/images/british-flag.png";
import headerBg from "../assets/images/header-bg.jpg";
import audioon from "../assets/images/audio-on.png";
import audiooff from "../assets/images/audio-off.png";
import font from "../assets/images/font.png";
import dark from "../assets/images/dark-mode.png";
import info from "../assets/images/info.png";
import MainModal from "./MainModal";

const Header = ({
  language = "GE",
  setLanguage = () => {},
  soundEnabled = false,
  setSoundEnabled = () => {},
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // 0=default, 1=large, 2=larger

  // Set default font size on mount
  useEffect(() => {
    try {
      localStorage.removeItem("fontSizeLevel");
      setFontSizeLevel(0);
      document.body.dataset.fontSize = "";
    } catch (e) {}
  }, []);

  const toggleFontSize = () => {
    const newLevel = (fontSizeLevel + 1) % 3;
    setFontSizeLevel(newLevel);
    document.body.dataset.fontSize = newLevel > 0 ? newLevel.toString() : "";
    try {
      localStorage.setItem("fontSizeLevel", newLevel.toString());
    } catch (e) {}
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("darkMode");
      const initial = stored === "true";
      setIsDarkMode(initial);
      if (initial) document.body.classList.add("dark");
      else document.body.classList.remove("dark");
    } catch (e) {}
  }, []);

  const toggleDark = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    try {
      localStorage.setItem("darkMode", newValue ? "true" : "false");
    } catch (e) {}
    if (newValue) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "GE" ? "EN" : "GE");
  };

  const toggleAudio = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);

    const message = newValue
      ? language === "GE"
        ? "აუდიო გახმოვანების ჩართვა"
        : "Turn on audio playback"
      : language === "GE"
      ? "აუდიო გახმოვანების გამორთვა"
      : "Turn off audio playback";

    if (message) {
      const langParam = language === "GE" ? "ka" : "en";
      const url = `http://localhost:5000/api/tts?text=${encodeURIComponent(
        message
      )}&lang=${langParam}`;

      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio.currentTime = 0;
      }

      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.play().catch(() => {});
      window.currentAudio = audio;
    }
  };

  const fontClass = language === "GE" ? "bpg_mrgvlovani_caps" : "bpg_mrgvlovani_caps";

  return (
    <header
      className={`relative w-full flex justify-center ${fontClass}`}
      style={{
        backgroundImage: `url(${headerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "15px",
      }}
    >
      <div className="w-full max-w-[1200px] flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <div className="flex items-center justify-start">
          <Link to="https://www.geostat.ge/ka" aria-label="Home">
            <img
              src={language === "GE" ? sakstatLogoGe : sakstatLogoEn}
              alt="Logo"
              className="h-[52px] md:h-[72px] hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Title */}
        <h1
          className="text-center text-white text-[20px] bpg_mrgvlovani_caps"
          id="titletext"
          tabIndex={0}
        >
          {language === "GE"
            ? "სამომხმარებლო ფასების ინდექსის კალკულატორი"
            : "Consumer Price Index Calculator"}
        </h1>

        {/* Icons & Language Switch */}
        <div className="flex flex-col items-end justify-end gap-4">
          {/* Top icons */}
          <div className="flex items-center justify-end gap-2 p-0 leading-[0] mt-[10px] mr-[38px]">
            <img
              src={soundEnabled ? audioon : audiooff}
              id="sounds"
              tabIndex={0}
              role="button"
              alt="audio"
              onClick={toggleAudio}
              className={`w-[22px] h-[23px] cursor-pointer transition-transform hover:scale-110 ${
                soundEnabled ? "sound-on" : ""
              }`}
            />
            <img
              src={font}
              alt="font size"
              role="button"
              tabIndex={0}
              onClick={toggleFontSize}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleFontSize();
              }}
              className="w-[22px] h-[23px] cursor-pointer transition-transform hover:scale-110"
              aria-label={`Toggle font size (currently ${
                fontSizeLevel === 0
                  ? "default"
                  : fontSizeLevel === 1
                  ? "large"
                  : "larger"
              })`}
            />
            <img
              src={dark}
              id="darkModeToggle"
              role="button"
              aria-pressed={isDarkMode}
              tabIndex={0}
              alt="dark"
              onClick={toggleDark}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleDark();
              }}
              className="w-[22px] h-[23px] cursor-pointer transition-transform hover:scale-110"
            />
            <img
              src={info}
              alt="info"
              className="w-[22px] h-[23px] cursor-pointer transition-transform hover:scale-110"
              onClick={() => setIsModalOpen(true)}
            />
          </div>

          {/* Language toggle */}
          <div className="mr-[38px] mt-7">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-white/90 hover:bg-white px-4 py-2.5 rounded-md transition-all duration-300 cursor-pointer period-select"
            >
              <span className="text-gray-700 text-sm md:text-base font-medium cursor-pointer language-toggle">
                {language === "GE" ? "English" : "ქართული"}
              </span>
              <img
                src={language === "GE" ? britishFlag : georgianFlag}
                alt="flag"
                className="w-6 h-6 md:w-7 md:h-7"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <MainModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          language={language}
        />
      )}
    </header>
  );
};

export default Header;

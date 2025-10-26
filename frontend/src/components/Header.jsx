import React, { useState } from "react";
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

const Header = ({ language = "GE", setLanguage = () => {} }) => {
  // start with audio OFF 🔇
  const [isAudioOn, setIsAudioOn] = useState(false);
  const fontClass =
    language === "GE" ? "bpg_mrgvlovani_caps" : "bpg_mrgvlovani_caps";

  const toggleLanguage = () => {
    setLanguage(language === "GE" ? "EN" : "GE");
  };

  const toggleAudio = () => {
    setIsAudioOn((prev) => !prev);
  };

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
        <h1 className="text-center text-white text-[20px] bpg_mrgvlovani_caps">
          {language === "GE"
            ? "სამომხმარებლო ფასების ინდექსის კალკულატორი"
            : "Consumer Price Index Calculator"}
        </h1>

        {/* Icons & Language Switch */}
        <div className="flex flex-col items-end justify-end gap-4">
          {/* Top icons */}
          <div className="flex items-center justify-end gap-2 p-0 leading-[0] mt-[10px] mr-[38px]">
            <img
              src={isAudioOn ? audioon : audiooff}
              alt="audio"
              onClick={toggleAudio}
              className="w-[22px] h-[23px] cursor-pointer transition-transform hover:scale-110"
            />
            <img
              src={font}
              alt="font"
              className="w-[22px] h-[23px] cursor-pointer transition-transform hover:scale-110"
            />
            <img
              src={dark}
              alt="dark"
              className="w-[22px] h-[23px] cursor-pointer transition-transform hover:scale-110"
            />
            <img
              src={info}
              alt="info"
              className="w-[22px] h-[23px] cursor-pointer transition-transform hover:scale-110"
            />
          </div>

          {/* Language toggle */}
          <div className="mr-[38px] mt-7">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-white/90 hover:bg-white px-4 py-2.5 rounded-md transition-all duration-300 cursor-pointer"
            >
              <span className="text-gray-700 text-sm md:text-base font-medium cursor-pointer">
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
    </header>
  );
};

export default Header;

import React from "react";

const Footer = ({ language = "GE" }) => {
  return (
    <footer className="w-full text-center text-sm text-gray-700 py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-xs sm:text-sm text-gray-600 leading-5 bpg_mrgvlovani_caps">
          {language === "GE" ? "© 2025 ყველა უფლება დაცულია." : "© 2025 All rights reserved."}
          <br />
          {language === "GE"
            ? "საქართველოს სტატისტიკის ეროვნული სამსახური (საქსტატი)"
            : "National Statistics Office of Georgia (Geostat)"}
          <br />
          <a
            href="https://www.geostat.ge/ka/page/monacemta-gamoyenebis-pirobebi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {language === "GE" ? "მონაცემთა გამოყენების პირობები" : "Terms of Use"}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

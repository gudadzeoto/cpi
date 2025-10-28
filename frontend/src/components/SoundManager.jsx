import React, { useEffect, useRef, useCallback } from "react";

const SoundManager = ({
  soundEnabled,
  language = "GE",
  startYear,
  startMonth,
  endYear,
  endMonth,
  calculatedValue,
  amount,
  monthsWithShi,
  monthsWithTan,
}) => {
  const currentAudioRef = useRef(null);

  const playText = useCallback(
    (text) => {
      if (!soundEnabled || !text) return;
      try {
        const langParam = language === "GE" ? "ka" : "en";
        const url = `http://localhost:5000/api/tts?text=${encodeURIComponent(
          text
        )}&lang=${langParam}`;

        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        }

        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {
        console.error("TTS error:", e);
      }
    },
    [soundEnabled, language]
  );

  useEffect(() => {
    window.playText = playText;
    return () => {
      window.playText = null;
    };
  }, [playText]);

  useEffect(() => {
    if (soundEnabled) document.body.classList.add("sound");
    else document.body.classList.remove("sound");
  }, [soundEnabled]);

  useEffect(() => {
    const onFocusIn = (e) => {
      if (!soundEnabled) return;
      let t = e.target;
      if (!t) return;

      // Ensure we have an Element (not a text node)
      if (t.nodeType !== 1 && t.parentElement) t = t.parentElement;

      // Find nearest ancestor element with an id (closest polyfill / fallback)
      const findNearestWithId = (node) => {
        let n = node;
        while (n && n.nodeType === 1) {
          if (n.id) return n;
          n = n.parentElement;
        }
        return null;
      };
      const nearestWithId =
        t.closest && typeof t.closest === "function"
          ? t.closest("[id]")
          : findNearestWithId(t);

      // If focus is on a container, try to find a child with specific ids (e.g., resultText or Note)
      const childResult =
        !nearestWithId && t.querySelector
          ? t.querySelector("#resultText,#resultTexts, #Note")
          : null;

      const targetElem = nearestWithId || childResult || t;
      const id = (targetElem && targetElem.id) || "";

      switch (id) {
        case "titletext":
          playText(
            language === "GE"
              ? "სამომხმარებლო ფასების ინდექსის კალკულატორი"
              : "Consumer Price Index Calculator"
          );
          break;

        case "startYearSlct":
        case "endYearSlct":
          playText(
            language === "GE"
              ? "სასურველი წლის ასარჩევად გამოიყენეთ კლავიატურაზე არსებული ისრები"
              : "Use keyboard arrows to select a year"
          );
          break;

        case "startMonthSlct":
        case "endMonthSlct":
          playText(language === "GE" ? "სასურველი თვის ასარჩევად გამოიყენეთ კლავიატურაზე არსებული ისრები" : "Select month");
          break;

        case "amountSlct":
          playText(language === "GE" ? "მიუთითეთ თანხა" : "Enter the amount");
          break;

        case "resultText":
          break;

        case "resultTexts":
          break;

        case "Note":
          playText(
            language === "GE"
              ? `შენიშვნა: საბოლოო პერიოდი მონაწილეობს გაანგარიშებაში.`
              : `Note: the end period participates in calculation.`
          );
          break;

        default:
          const text = (t.innerText || t.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
          if (text) playText(text);
      }
    };

    const onKeyDown = (e) => {
      if (!soundEnabled) return;
      const t = e.target;
      if (!t) return;
      if (
        t.tagName === "SELECT" &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        setTimeout(() => {
          const opt = t.options[t.selectedIndex];
          const text = (opt && opt.text) || "";
          if (text) playText(text);
        }, 50);
      }
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [
    soundEnabled,
    language,
    playText,
    startYear,
    startMonth,
    endYear,
    endMonth,
    calculatedValue,
    monthsWithShi,
    monthsWithTan,
  ]);
  return null;
};

export default SoundManager;

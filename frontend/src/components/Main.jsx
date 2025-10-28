import React, { useState, useEffect, useRef, useCallback } from "react";
import Highcharts from "highcharts";
import exportingInit from "highcharts/modules/exporting";
import exportDataInit from "highcharts/modules/export-data";
import HighchartsReact from "highcharts-react-official";
import InfoModal from "./InfoModal";
import api from "../api";
import SoundManager from "./SoundManager";

try {
  exportingInit(Highcharts);
  exportDataInit(Highcharts);
} catch (e) {
  void e;
}

// Month labels declared at module scope so their identity is stable across renders
const monthsGE = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];

const monthsEN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Main = ({
  language = "GE",
  setLanguage = () => {},
  soundEnabled = false,
}) => {
  const [startYear, setStartYear] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [amount, setAmount] = useState("100");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRef = useRef(null);
  const [chartCategories, setChartCategories] = useState([2024, 2025]);
  const [chartData, setChartData] = useState([0, 0]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  const months = language === "GE" ? monthsGE : monthsEN;

  const years = Array.from({ length: 2025 - 1988 + 1 }, (_, i) => 2025 - i);

  const isValidPeriod = () => {
    if (!startYear || !startMonth || !endYear || !endMonth) return true;
    if (parseInt(startYear) > parseInt(endYear)) return false;
    if (
      parseInt(startYear) === parseInt(endYear) &&
      parseInt(startMonth) > parseInt(endMonth)
    )
      return false;
    return true;
  };

  const [calculatedValue, setCalculatedValue] = useState(null);

  const computedAmount = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || calculatedValue === null) return 0;
    const multiplier = 1 + parseFloat(calculatedValue) / 100;
    return (numericAmount * multiplier).toFixed(2);
  };

  const calculateIndex = useCallback(async () => {
    if (!startYear || !startMonth || !endYear || !endMonth) return;
    setIsLoadingChart(true);

    const start_date = await api.get(`/cpiindexes/${startYear}/${startMonth}`);
    const end_date = await api.get(`/cpiindexes/${endYear}/${endMonth}`);

    const index_start_date = start_date.data[0].Index;
    const index_end_date = end_date.data[0].Index;

    const calculated = (
      (index_end_date / index_start_date) * 100 -
      100
    ).toFixed(2);
    setCalculatedValue(calculated);

    // Generate month-by-month interval from startYear/startMonth to endYear/endMonth
    const startY = parseInt(startYear, 10);
    const startM = parseInt(startMonth, 10);
    const endY = parseInt(endYear, 10);
    const endM = parseInt(endMonth, 10);
    const pairs = [];
    let cy = startY;
    let cm = startM;
    while (cy < endY || (cy === endY && cm <= endM)) {
      pairs.push({ year: cy, month: cm });
      cm += 1;
      if (cm > 12) {
        cm = 1;
        cy += 1;
      }
    }

    // Build localized category labels (e.g., "Jan 1995" or Georgian month + year)
    const labels = pairs.map((p) => `${months[p.month - 1]} ${p.year}`);
    setChartCategories(labels);

    // Fetch CPI for each month in the interval
    const dataPromises = pairs.map(async (p) => {
      try {
        const res = await api.get(`/cpiindexes/${p.year}/${p.month}`);
        return res.data && res.data[0] ? res.data[0].Index : null;
      } catch {
        return null;
      }
    });

    let indexes = [];
    try {
      indexes = await Promise.all(dataPromises);
    } catch (err) {
      // if some requests fail, fill missing with nulls
      console.error("Failed fetching yearly CPI", err);
    }

    // Convert to % change from start; if missing, set null
    const dynamicData = indexes.map((index) => {
      if (index == null || index === undefined) return null;
      return Number(((index / index_start_date) * 100 - 100).toFixed(2));
    });
    setChartData(dynamicData);
    setIsLoadingChart(false);
  }, [startYear, startMonth, endYear, endMonth, months]);

  useEffect(() => {
    calculateIndex();
  }, [calculateIndex]);

  const monthsWithTan = (month) => {
    const m = parseInt(month, 10);
    if (m < 1 || m > 12) return "";
    switch (m) {
      case 1:
        return "იანვართან";
      case 2:
        return "თებერვალთან";
      case 3:
        return "მარტთან";
      case 4:
        return "აპრილთან";
      case 5:
        return "მაისთან";
      case 6:
        return "ივნისთან";
      case 7:
        return "ივლისთან";
      case 8:
        return "აგვისტოსთან";
      case 9:
        return "სექტემბერთან";
      case 10:
        return "ოქტომბერთან";
      case 11:
        return "ნოემბერთან";
      case 12:
        return "დეკემბერთან";
      default:
        return "";
    }
  };

  const monthsWithShi = (month) => {
    const m = parseInt(month, 10);
    if (m < 1 || m > 12) return "";
    switch (m) {
      case 1:
        return "იანვარში";
      case 2:
        return "თებერვალში";
      case 3:
        return "მარტში";
      case 4:
        return "აპრილში";
      case 5:
        return "მაისში";
      case 6:
        return "ივნისში";
      case 7:
        return "ივლისში";
      case 8:
        return "აგვისტოში";
      case 9:
        return "სექტემბერში";
      case 10:
        return "ოქტომბერში";
      case 11:
        return "ნოემბერში";
      case 12:
        return "დეკემბერში";
      default:
        return "";
    }
  };

  const monthsWithIs = (month) => {
    const m = parseInt(month, 10);
    if (m < 1 || m > 12) return "";
    switch (m) {
      case 1:
        return "იანვრის";
      case 2:
        return "თებერვლის";
      case 3:
        return "მარტის";
      case 4:
        return "აპრილის";
      case 5:
        return "მაისის";
      case 6:
        return "ივნისის";
      case 7:
        return "ივლისის";
      case 8:
        return "აგვისტოს";
      case 9:
        return "სექტემბრის";
      case 10:
        return "ოქტომბრის";
      case 11:
        return "ნოემბერის";
      case 12:
        return "დეკემბერის";
      default:
        return "";
    }
  };

  // Highcharts options
  const chartOptions = {
    chart: { backgroundColor: "transparent" },
    credits: { enabled: false },
    title: {
      text:
        language === "GE"
          ? "სამომხმარებლო ფასების ინდექსის ცვლილება საბაზო (საწყის) პერიოდთან შედარებით"
          : "Consumer Price Index change compared to base period",
      style: {
        fontSize: "14px",
        fontFamily: "bpg_mrgvlovani_caps",
        color: "#333333",
      },
    },
    xAxis: {
      title: {
        text: "",
        style: {
          fontFamily: "bpg_mrgvlovani_caps",
          fontSize: "13px",
          color: "#333333",
        },
      },
      categories: chartCategories,
      labels: {
        style: {
          fontFamily: "bpg_mrgvlovani_caps",
          fontSize: "9px",
          color: "#555555",
        },
      },
      lineColor: "#999999",
      lineWidth: 1,
      tickColor: "#999999",
      tickWidth: 1,
      gridLineColor: "#e0e0e0",
    },
    yAxis: {
      title: {
        text: language === "GE" ? "პროცენტი (%)" : "Percent (%)",
        style: {
          fontFamily: "bpg_mrgvlovani_caps",
          color: "#333333",
        },
      },
    },
    series: [
      {
        name:
          language === "GE"
            ? "სამომხმარებლო ფასების ინდექსის ცვლილება"
            : "Consumer Price Index change",
        data: chartData,
        color: "var(--highcharts-color-1, #2caffe)",
        tooltip: {
          valueSuffix: "%",
        },
      },
    ],
    legend: {
      itemStyle: {
        fontFamily: "bpg_mrgvlovani_caps",
        color: "#333333",
      },
    },
  };

  return (
    <section
      className="bg-white shadow-md bpg_mrgvlovani_caps w-full"
      style={{ border: "1px solid #01389c" }}
    >
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full bg-gray-100 rounded-md py-2 mb-4 flex justify-center">
            <h3 className="md:text-base font-semibold text-[#003366]">
              {language === "GE" ? "დროის პერიოდი" : "Time period"}
            </h3>
          </div>

          {/* Start */}
          <div className="flex items-center gap-7">
            <label className="text-red-600 font-semibold w-[80px] text-sm">
              {language === "GE" ? "საწყისი:" : "From:"}
            </label>
            <select
              value={startYear}
              id="startYearSlct"
              onChange={(e) => setStartYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#333]"
            >
              <option value="" disabled hidden>
                {language === "GE" ? "აირჩიეთ წელი" : "Select year"}
              </option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={startMonth}
              id="startMonthSlct"
              onChange={(e) => setStartMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#333]"
            >
              <option value="" disabled hidden>
                {language === "GE" ? "აირჩიეთ თვე" : "Select month"}
              </option>
              {months.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* End */}
          <div className="flex items-center gap-7">
            <label className="text-red-600 font-semibold w-[80px] text-sm">
              {language === "GE" ? "საბოლოო:" : "To:"}
            </label>
            <select
              value={endYear}
              id="endYearSlct"
              onChange={(e) => setEndYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#333]"
            >
              <option value="" disabled hidden>
                {language === "GE" ? "აირჩიეთ წელი" : "Select year"}
              </option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={endMonth}
              id="endMonthSlct"
              onChange={(e) => setEndMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#333]"
            >
              <option value="" disabled hidden>
                {language === "GE" ? "აირჩიეთ თვე" : "Select month"}
              </option>
              {months.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-7">
            <label className="text-red-600 font-semibold w-[80px] text-sm">
              {language === "GE" ? "თანხა:" : "Amount:"}
            </label>
            <input
              id="amountSlct"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-[370px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-right text-[#333]"
            />
          </div>
        </div>

        {/* Right Side — Result */}
        <div className="flex-1 bg-gray-50 border border-gray-300 rounded-md p-4 text-sm text-gray-700">
          {!isValidPeriod() ? (
            <p className="text-red-600 font-semibold">
              {language === "GE"
                ? "საბოლოო პერიოდი უნდა აღემატებოდეს საწყის პერიოდს."
                : "The end period is less than the beginning period."}
            </p>
          ) : startYear && startMonth && endYear && endMonth && amount ? (
            <div role="status" aria-live="polite" aria-atomic="true">
              <p className="mb-2 font-semibold text-center">
                {language === "GE" ? "შედეგი:" : "Result:"}
              </p>
              {/* RESULT TEXT */}
              <p
                className="mb-2"
                id="resultText"
                tabIndex={0}
                onClick={() => {
                  const text =
                    language === "GE"
                      ? `სამომხმარებლო ფასების ინდექსის ცვლილებამ ${endYear} წლის ${monthsWithShi(
                          endMonth
                        )}, ${startYear} წლის ${monthsWithTan(
                          startMonth
                        )} შედარებით შეადგინა ${calculatedValue} პროცენტი.`
                      : `Consumer Price Index change from ${
                          monthsEN[startMonth - 1]
                        } ${startYear} to ${
                          monthsEN[endMonth - 1]
                        } ${endYear} is ${calculatedValue} percent.`;
                  if (window.playText) window.playText(text);
                }}
              >
                სამომხმარებლო ფასების ინდექსის ცვლილებამ {endYear} წლის{" "}
                {monthsWithShi(endMonth)} {startYear} წლის{" "}
                {monthsWithTan(startMonth)} შედარებით შეადგინა{" "}
                <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                  {calculatedValue}%.
                </span>
              </p>
              {/* AMOUNT RESULT */}
              <p
                className="mb-2"
                id="resultTexts"
                tabIndex={0}
                onClick={() => {
                  const text =
                    language === "GE"
                      ? `${startYear} წლის ${monthsWithIs(
                          startMonth
                        )} ${amount} ლარი ლარის ინფლაციის გათვალისწინებით ${endYear} წლის ${monthsWithIs(
                          endMonth
                        )} მდგომარეობით შეადგენს ${computedAmount()} ლარს.`
                      : `${amount} lari in ${
                          monthsEN[startMonth - 1]
                        } ${startYear}, adjusted for inflation, equals ${computedAmount()} lari as of ${
                          monthsEN[endMonth - 1]
                        } ${endYear}.`;
                  if (window.playText) window.playText(text);
                }}
              >
                {startYear} წლის {monthsWithIs(startMonth)}{" "}
                <span style={{ fontWeight: "bold", color: "#01389c" }}>
                  {amount}
                </span>{" "}
                ლარი ლარის ინფლაციის გათვალისწინებით {endYear} წლის{" "}
                {monthsWithIs(endMonth)} მდგომარეობით შეადგენს{" "}
                <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                  {computedAmount()}
                </span>{" "}
                ლარს.
              </p>

              {/* NOTE TEXT */}
              <p
                className="text-gray-500 text-xs"
                id="Note"
                tabIndex={0}
                onClick={() => {
                  const text =
                    language === "GE"
                      ? "შენიშვნა: საბოლოო პერიოდი მონაწილეობს გაანგარიშებაში."
                      : "Note: the end period participates in calculation.";
                  if (window.playText) window.playText(text);
                }}
              >
                {language === "GE"
                  ? "შენიშვნა: საბოლოო პერიოდი მონაწილეობს გაანგარიშებაში."
                  : "Note: the end period participates in calculation."}
              </p>
            </div>
          ) : (
            <p>
              {language === "GE"
                ? "აირჩიეთ დროის პერიოდები და თანხა შედეგის სანახავად."
                : "Select time periods and amount to see results."}
            </p>
          )}
        </div>
      </div>

      {/* Bottom blue bar */}
      <div className="mt-6 bg-[#01389c] text-white text-right px-4 py-4 text-sm font-medium flex items-center justify-end gap-1 w-full mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-white cursor-pointer text-sm font-medium"
          aria-label="Information"
        >
          <span>
            {language === "GE"
              ? "გაანგარიშების ინსტრუქცია"
              : "Calculation instruction"}
          </span>
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        </button>
      </div>

      <div className="relative">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
        />
        {isLoadingChart && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.7)",
              zIndex: 20,
            }}
          >
            <div className="text-sm font-medium text-gray-700">
              {language === "GE" ? "ჩატვირთვა..." : "Loading..."}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <InfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          language={language}
        />
      )}
      {/* Mount SoundManager here so it has access to Main's state and helper functions */}
      <SoundManager
        soundEnabled={soundEnabled}
        language={language}
        startYear={startYear}
        startMonth={startMonth}
        endYear={endYear}
        endMonth={endMonth}
        calculatedValue={calculatedValue}
        amount={amount}
        monthsWithShi={monthsWithShi}
        monthsWithTan={monthsWithTan}
      />
    </section>
  );
};

export default Main;

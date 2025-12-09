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
  const [showWarningModal, setShowWarningModal] = useState(false);

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

  const [indexStartDate, setIndexStartDate] = useState(null);
  const [indexEndDate, setIndexEndDate] = useState(null);

  const computedAmount = () => {
    const numericAmount = parseFloat(amount);
    if (
      isNaN(numericAmount) ||
      indexStartDate === null ||
      indexEndDate === null
    )
      return 0;
    if (Number(indexStartDate) === 0) return 0;
    const result =
      (Number(indexEndDate) / Number(indexStartDate)) * numericAmount;
    return Number(result).toFixed(2);
  };

  const calculateIndex = useCallback(async () => {
    if (!startYear || !startMonth || !endYear || !endMonth) return;
    setIsLoadingChart(true);

    const start_date = await api.get(`/cpiindexes/${startYear}/${startMonth}`);
    const end_date = await api.get(`/cpiindexes/${endYear}/${endMonth}`);

    const index_start_date = start_date.data[0].Index;
    const index_end_date = end_date.data[0].Index;

    // store raw index values for other calculations
    setIndexStartDate(index_start_date);
    setIndexEndDate(index_end_date);

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

  // Check for 1988-1990 warning based on year selection alone
  useEffect(() => {
    if (startYear && endYear) {
      const startY = parseInt(startYear, 10);
      const endY = parseInt(endYear, 10);
      if (
        (startY >= 1988 && startY <= 1990 && endY >= 1988 && endY <= 1990) ||
        startY === 1990 ||
        endY === 1990
      ) {
        setShowWarningModal(true);
      } else {
        setShowWarningModal(false);
      }
    }
  }, [startYear, endYear]);

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

  const getCurrencyText = (year) => {
    const y = parseInt(year, 10);
    if (y >= 1988 && y <= 1995) {
      return "კუპონი კუპონის და ლარის";
    }
    return "ლარი ლარის";
  };

  const getCurrencyTextEN = (year) => {
    const y = parseInt(year, 10);
    if (y >= 1988 && y <= 1995) return "Maneti";
    return "Georgian Lari";
  };

  // Helper to check if a period is in the manat era (1988 to March 1993)
  const isManatPeriod = () => {
    if (!startYear || !startMonth || !endYear || !endMonth) return false;
    const startY = parseInt(startYear, 10);
    const startM = parseInt(startMonth, 10);
    const endY = parseInt(endYear, 10);
    const endM = parseInt(endMonth, 10);
    // Manat period: from 1988 onwards to March 1993 (year 1993, month 3)
    return (
      startY >= 1988 &&
      startY <= 1993 &&
      (startY < 1993 || startM <= 3) &&
      endY >= 1988 &&
      endY <= 1993 &&
      (endY < 1993 || endM <= 3)
    );
  };

  // Helper to check if a period is in the coupon-only era (August 1993 to September 1995)
  const isCouponOnlyPeriod = () => {
    if (!startYear || !startMonth || !endYear || !endMonth) return false;
    const startY = parseInt(startYear, 10);
    const startM = parseInt(startMonth, 10);
    const endY = parseInt(endYear, 10);
    const endM = parseInt(endMonth, 10);
    // Coupon-only period: August 1993 (1993-8) to September 1995 (1995-9)
    return (
      startY >= 1993 &&
      startY <= 1995 &&
      (startY > 1993 || startM >= 8) &&
      endY >= 1993 &&
      endY <= 1995 &&
      (endY < 1995 || endM <= 9)
    );
  };

  // Helper to check if a period is in the lari era (October 1995 onwards)
  const isLariPeriod = () => {
    if (!startYear || !startMonth || !endYear || !endMonth) return false;
    const startY = parseInt(startYear, 10);
    const startM = parseInt(startMonth, 10);
    const endY = parseInt(endYear, 10);
    const endM = parseInt(endMonth, 10);
    // Lari period: October 1995 (1995-10) onwards
    return (
      (startY > 1995 || (startY === 1995 && startM >= 10)) &&
      (endY > 1995 || (endY === 1995 && endM >= 10))
    );
  };

  // Highcharts options
  const titleFontSize = language === "GE" ? "var(--h4-font-size)" : "14px";

  const chartOptions = {
    chart: { backgroundColor: "transparent" },
    credits: { enabled: false },
    title: {
      text:
        language === "GE"
          ? "სამომხმარებლო ფასების ინდექსის ცვლილება საბაზო (საწყის) პერიოდთან შედარებით"
          : "Consumer Price Index change compared to base period",
      useHTML: language === "GE",
      align: "center",
      x: 0,
      style: {
        display: "block",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        fontSize: titleFontSize,
        fontFamily: "bpg_mrgvlovani_caps",
        color: "#333333",
        whiteSpace: "normal",
        // textAlign: "center",
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
            <h3 className="md:text-base font-semibold text-[#003366] period-title">
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
              onChange={(e) => {
                const val = e.target.value;
                setStartYear(val);
                const y = parseInt(val, 10);
                if (y >= 1988 && y <= 1990) {
                  setStartMonth("1");
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#333] period-select cursor-pointer"
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
              disabled={
                startYear &&
                parseInt(startYear, 10) >= 1988 &&
                parseInt(startYear, 10) <= 1990
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#333] period-select cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
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
              id="endYear"
              onChange={(e) => {
                const val = e.target.value;
                setEndYear(val);
                const y = parseInt(val, 10);
                if (y >= 1988 && y <= 1990) {
                  setEndMonth("12");
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#333] period-select cursor-pointer"
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
              disabled={
                endYear &&
                parseInt(endYear, 10) >= 1988 &&
                parseInt(endYear, 10) <= 1990
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#333] period-select cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
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
            <label className="text-red-600 font-semibold w-[80px] text-sm ">
              {language === "GE" ? "თანხა:" : "Amount:"}
            </label>
            <input
              id="amountSlct"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-[380px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-right text-[#333] amount-select"
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

              {/* NOTE TEXT - Show at beginning if start year is 1988-1990 */}
              {parseInt(startYear, 10) >= 1988 && parseInt(startYear, 10) <= 1990 && (
                <p
                  className="text-gray-500 text-xs note-select mb-3"
                  tabIndex={0}
                  onClick={() => {
                    const text =
                      language === "GE"
                        ? "1988-1990 წლებში გაანგარიშებაში მონაწილეობს ინფლაციის წლიური კოეფიციენტები."
                        : "In 1988-1990 annual inflation coefficients are used for calculation.";
                    if (window.playText) window.playText(text);
                  }}
                >
                  {language === "GE"
                    ? "1988-1990 წლებში გაანგარიშებაში მონაწილეობს ინფლაციის წლიური კოეფიციენტები."
                    : "In 1988-1990 annual inflation coefficients are used for calculation."}
                </p>
              )}

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
                        )} ${startYear} წლის ${monthsWithTan(
                          startMonth
                        )} შესაბამის პერიოდში შეადგინა ${calculatedValue} პროცენტი.`
                      : `The change in the Consumer Price Index in ${
                          monthsEN[endMonth - 1]
                        } ${endYear} compared to ${
                          monthsEN[startMonth - 1]
                        } ${startYear} amounted to ${calculatedValue} percent.`;

                  if (window.playText) window.playText(text);
                }}
              >
                {language === "GE" ? (
                  <>
                    სამომხმარებლო ფასების ინდექსის ცვლილებამ {endYear} წლის{" "}
                    {monthsWithShi(endMonth)} {startYear} წლის{" "}
                    {monthsWithTan(startMonth)} შედარებით შეადგინა{" "}
                    <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                      {calculatedValue}%.
                    </span>
                  </>
                ) : (
                  <>
                    The Consumer Price Index change in {monthsEN[endMonth - 1]}{" "}
                    {endYear} compared to {monthsEN[startMonth - 1]} {startYear}{" "}
                    amounted to{" "}
                    <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                      {calculatedValue}%.
                    </span>
                  </>
                )}
              </p>

              {/* AMOUNT RESULT */}
              <p
                className="mb-2"
                id="resultTexts"
                tabIndex={0}
                onClick={() => {
                  const currencyText = getCurrencyText(startYear);
                  const text =
                    language === "GE"
                      ? `${startYear} წლის ${monthsWithIs(
                          startMonth
                        )} ${amount} ${currencyText} ინფლაციის გათვალისწინებით ${endYear} წლის ${monthsWithIs(
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
                {parseInt(startYear, 10) >= 1988 &&
                parseInt(startYear, 10) <= 1992 &&
                parseInt(endYear, 10) >= 1995 &&
                !(endYear === "1995" && parseInt(endMonth, 10) <= 9) ? (
                  language === "GE" ? (
                    <>
                      {startYear} წლის{" "}
                      {parseInt(startYear, 10) >= 1988 &&
                      parseInt(startYear, 10) <= 1990
                        ? ""
                        : monthsWithIs(startMonth) + " "}
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      მანეთი მანეთის, კუპონის და ლარის ინფლაციის გათვალისწინებით{" "}
                      {endYear} წლის {monthsWithIs(endMonth)} მდგომარეობით
                      შეადგენს{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      ლარს.
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      manat in{" "}
                      {parseInt(startYear, 10) >= 1988 &&
                      parseInt(startYear, 10) <= 1990
                        ? startYear
                        : `${monthsEN[startMonth - 1]} ${startYear}`}
                      , taking into consideration manat, coupon and lari
                      inflation, equals{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      lari as of{" "}
                      {parseInt(endYear, 10) >= 1988 &&
                      parseInt(endYear, 10) <= 1990
                        ? endYear
                        : `${monthsEN[endMonth - 1]} ${endYear}`}
                      .
                    </>
                  )
                ) : parseInt(startYear, 10) >= 1988 &&
                  parseInt(startYear, 10) <= 1993 &&
                  !(
                    parseInt(startYear, 10) === 1993 &&
                    parseInt(startMonth, 10) >= 4
                  ) &&
                  (endYear === "1994" ||
                    (endYear === "1995" && parseInt(endMonth, 10) <= 9)) ? (
                  language === "GE" ? (
                    <>
                      {startYear} წლის{" "}
                      {parseInt(startYear, 10) >= 1988 &&
                      parseInt(startYear, 10) <= 1990
                        ? ""
                        : monthsWithIs(startMonth) + " "}
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      მანეთი მანეთის და კუპონის ინფლაციის გათვალისწინებით{" "}
                      {endYear} წლის {monthsWithIs(endMonth)} მდგომარეობით
                      შეადგენს{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      კუპონს.
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      manat in{" "}
                      {parseInt(startYear, 10) >= 1988 &&
                      parseInt(startYear, 10) <= 1990
                        ? startYear
                        : `${monthsEN[startMonth - 1]} ${startYear}`}
                      , taking into consideration manat and coupon inflation,
                      equals{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      coupon as of{" "}
                      {parseInt(endYear, 10) >= 1988 &&
                      parseInt(endYear, 10) <= 1990
                        ? endYear
                        : `${monthsEN[endMonth - 1]} ${endYear}`}
                      .
                    </>
                  )
                ) : startYear === "1993" &&
                  parseInt(startMonth, 10) >= 4 &&
                  parseInt(startMonth, 10) <= 7 &&
                  (endYear === "1994" || endYear === "1995") ? (
                  language === "GE" ? (
                    <>
                      {startYear} წლის {monthsWithIs(startMonth)}{" "}
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      კუპონი/მანეთი მანეთის და კუპონის ინფლაციის გათვალისწინებით{" "}
                      {endYear} წლის {monthsWithIs(endMonth)} მდგომარეობით
                      შეადგენს{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      კუპონს.
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      coupon/manat in {monthsEN[startMonth - 1]} {startYear},
                      taking into consideration manat and coupon inflation,
                      equals{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      coupon as of {monthsEN[endMonth - 1]} {endYear}.
                    </>
                  )
                ) : startYear === "1993" &&
                  parseInt(startMonth, 10) >= 4 &&
                  parseInt(startMonth, 10) <= 7 &&
                  parseInt(endYear, 10) >= 1996 ? (
                  language === "GE" ? (
                    <>
                      {startYear} წლის {monthsWithIs(startMonth)}{" "}
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      კუპონი/მანეთი მანეთის, კუპონის და ლარის ინფლაციის
                      გათვალისწინებით {endYear} წლის {monthsWithIs(endMonth)}{" "}
                      მდგომარეობით შეადგენს{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      ლარს.
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      coupon/manat in {monthsEN[startMonth - 1]} {startYear},
                      taking into consideration manat, coupon and lari
                      inflation, equals{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      lari as of {monthsEN[endMonth - 1]} {endYear}.
                    </>
                  )
                ) : startYear === "1993" &&
                  startMonth === "4" &&
                  endYear === "1993" &&
                  parseInt(endMonth, 10) >= 4 &&
                  parseInt(endMonth, 10) <= 7 &&
                  language === "GE" ? (
                  <>
                    {startYear} წლის {monthsWithIs(startMonth)}{" "}
                    <span style={{ fontWeight: "bold", color: "#01389c" }}>
                      {amount}
                    </span>{" "}
                    კუპონი/მანეთი მანეთის და კუპონის ინფლაციის გათვალისწინებით{" "}
                    {endYear} წლის {monthsWithIs(endMonth)} მდგომარეობით
                    შეადგენს{" "}
                    <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                      {computedAmount()}
                    </span>{" "}
                    კუპონს.
                  </>
                ) : endYear === "1992" &&
                  parseInt(endMonth, 10) >= 4 &&
                  parseInt(endMonth, 10) <= 12 &&
                  language === "GE" ? (
                  <>
                    {startYear} წლის{" "}
                    {parseInt(startYear, 10) >= 1988 &&
                    parseInt(startYear, 10) <= 1990
                      ? ""
                      : monthsWithIs(startMonth) + " "}
                    <span style={{ fontWeight: "bold", color: "#01389c" }}>
                      {amount}
                    </span>{" "}
                    მანეთი მანეთის, კუპონის და ლარის ინფლაციის გათვალისწინებით{" "}
                    {endYear} წლის{" "}
                    {parseInt(endYear, 10) >= 1988 &&
                    parseInt(endYear, 10) <= 1990
                      ? ""
                      : monthsWithIs(endMonth) + " "}
                    მდგომარეობით შეადგენს{" "}
                    <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                      {computedAmount()}
                    </span>{" "}
                    ლარს.
                  </>
                ) : endYear === "1993" &&
                  parseInt(endMonth, 10) >= 4 &&
                  parseInt(endMonth, 10) <= 12 &&
                  language === "GE" ? (
                  <>
                    {startYear} წლის{" "}
                    {parseInt(startYear, 10) >= 1988 &&
                    parseInt(startYear, 10) <= 1990
                      ? ""
                      : monthsWithIs(startMonth) + " "}
                    <span style={{ fontWeight: "bold", color: "#01389c" }}>
                      {amount}
                    </span>{" "}
                    მანეთი მანეთის და კუპონის ინფლაციის გათვალისწინებით{" "}
                    {endYear} წლის{" "}
                    {parseInt(endYear, 10) >= 1988 &&
                    parseInt(endYear, 10) <= 1990
                      ? ""
                      : monthsWithIs(endMonth) + " "}
                    მდგომარეობით შეადგენს{" "}
                    <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                      {computedAmount()}
                    </span>{" "}
                    კუპონს.
                  </>
                ) : ((parseInt(startYear, 10) === 1993 &&
                    parseInt(startMonth, 10) >= 8) ||
                    parseInt(startYear, 10) === 1994 ||
                    (parseInt(startYear, 10) === 1995 &&
                      parseInt(startMonth, 10) <= 9)) &&
                  ((endYear === "1993" && parseInt(endMonth, 10) >= 8) ||
                    endYear === "1994" ||
                    (endYear === "1995" && parseInt(endMonth, 10) <= 9)) &&
                  language === "GE" ? (
                  <>
                    {startYear} წლის {monthsWithIs(startMonth)}{" "}
                    <span style={{ fontWeight: "bold", color: "#01389c" }}>
                      {amount}
                    </span>{" "}
                    კუპონი კუპონის ინფლაციის გათვალისწინებით {endYear} წლის{" "}
                    {monthsWithIs(endMonth)} მდგომარეობით შეადგენს{" "}
                    <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                      {computedAmount()}
                    </span>{" "}
                    კუპონს.
                  </>
                ) : isCouponOnlyPeriod() ? (
                  language === "GE" ? (
                    <>
                      {startYear} წლის {monthsWithIs(startMonth)}{" "}
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      კუპონი კუპონის ინფლაციის გათვალისწინებით {endYear} წლის{" "}
                      {monthsWithIs(endMonth)} მდგომარეობით შეადგენს{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      კუპონს.
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      coupon in {monthsEN[startMonth - 1]} {startYear}, taking
                      into consideration coupon inflation, equals{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      coupon as of {monthsEN[endMonth - 1]} {endYear}.
                    </>
                  )
                ) : startYear === "1995" &&
                  startMonth === "1" &&
                  endYear === "1995" &&
                  parseInt(endMonth, 10) >= 10 &&
                  parseInt(endMonth, 10) <= 12 ? (
                  language === "GE" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      lari in {monthsEN[startMonth - 1]} {startYear}, taking
                      into consideration lari inflation, equals{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        0
                      </span>{" "}
                      lari as of {monthsEN[endMonth - 1]} {endYear}.
                    </>
                  )
                ) : isLariPeriod() ? (
                  language === "GE" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      lari in {monthsEN[startMonth - 1]} {startYear}, taking
                      into consideration lari inflation, equals{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      lari as of {monthsEN[endMonth - 1]} {endYear}.
                    </>
                  )
                ) : isManatPeriod() ? (
                  language === "GE" ? (
                    <>
                      {startYear} წლის{" "}
                      {parseInt(startYear, 10) >= 1988 &&
                      parseInt(startYear, 10) <= 1990
                        ? ""
                        : monthsWithIs(startMonth) + " "}
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      მანეთი მანეთის ინფლაციის გათვალისწინებით {endYear} წლის{" "}
                      {parseInt(endYear, 10) >= 1988 &&
                      parseInt(endYear, 10) <= 1990
                        ? ""
                        : monthsWithIs(endMonth) + " "}
                      მდგომარეობით შეადგენს{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      მანეთს.
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "#01389c" }}>
                        {amount}
                      </span>{" "}
                      manat in{" "}
                      {parseInt(startYear, 10) >= 1988 &&
                      parseInt(startYear, 10) <= 1990
                        ? startYear
                        : `${monthsEN[startMonth - 1]} ${startYear}`}
                      , taking into consideration inflation of Manet, is worth{" "}
                      <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                        {computedAmount()}
                      </span>{" "}
                      manat as of{" "}
                      {parseInt(endYear, 10) >= 1988 &&
                      parseInt(endYear, 10) <= 1990
                        ? endYear
                        : `${monthsEN[endMonth - 1]} ${endYear}`}
                      .
                    </>
                  )
                ) : language === "GE" ? (
                  <>
                    {startYear} წლის{" "}
                    {parseInt(startYear, 10) >= 1988 &&
                    parseInt(startYear, 10) <= 1990
                      ? ""
                      : monthsWithIs(startMonth) + " "}
                    <span style={{ fontWeight: "bold", color: "#01389c" }}>
                      {amount}
                    </span>{" "}
                    {getCurrencyText(startYear)} ინფლაციის გათვალისწინებით{" "}
                    {endYear} წლის{" "}
                    {parseInt(endYear, 10) >= 1988 &&
                    parseInt(endYear, 10) <= 1990
                      ? ""
                      : monthsWithIs(endMonth) + " "}
                    მდგომარეობით შეადგენს{" "}
                    <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                      {computedAmount()}
                    </span>{" "}
                    ლარს.
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: "bold", color: "#01389c" }}>
                      {amount}
                    </span>{" "}
                    {getCurrencyTextEN(startYear)} in{" "}
                    {parseInt(startYear, 10) >= 1988 &&
                    parseInt(startYear, 10) <= 1990
                      ? startYear
                      : `${monthsEN[startMonth - 1]} ${startYear}`}
                    , taking into consideration inflation of{" "}
                    {getCurrencyTextEN(startYear)}, is worth{" "}
                    <span style={{ fontWeight: "bold", color: "#EF1C31" }}>
                      {computedAmount()}
                    </span>{" "}
                    {getCurrencyTextEN(endYear)} in{" "}
                    {parseInt(endYear, 10) >= 1988 &&
                    parseInt(endYear, 10) <= 1990
                      ? endYear
                      : `${monthsEN[endMonth - 1]} ${endYear}`}
                    .
                  </>
                )}
              </p>

              {/* NOTE TEXT */}
              <p
                className="text-gray-500 text-xs note-select"
                id="Note"
                tabIndex={0}
                onClick={() => {
                  const text =
                    parseInt(startYear, 10) >= 1988 && parseInt(startYear, 10) <= 1990
                      ? language === "GE"
                        ? "1988-1990 წლებში გაანგარიშებაში მონაწილეობს ინფლაციის წლიური კოეფიციენტები."
                        : "In 1988-1990 annual inflation coefficients are used for calculation."
                      : language === "GE"
                      ? "შენიშვნა: საბოლოო პერიოდი მონაწილეობს გაანგარიშებაში."
                      : "Note: the end period participates in calculation.";
                  if (window.playText) window.playText(text);
                }}
              >
                {parseInt(startYear, 10) >= 1988 && parseInt(startYear, 10) <= 1990
                  ? language === "GE"
                    ? "1988-1990 წლებში გაანგარიშებაში მონაწილეობს ინფლაციის წლიური კოეფიციენტები."
                    : "In 1988-1990 annual inflation coefficients are used for calculation."
                  : language === "GE"
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
      {showWarningModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowWarningModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "500px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "16px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {language === "GE" ? "შენიშვნა" : "Note"}
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
              {language === "GE"
                ? "1988-1990 წლებში გაანგარიშებაში მონაწილეობს ინფლაციის წლიური კოეფიციენტები."
                : "In 1988-1990 annual inflation coefficients are used for calculation."}
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#01389c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {language === "GE" ? "დახურვა" : "Close"}
            </button>
          </div>
        </div>
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

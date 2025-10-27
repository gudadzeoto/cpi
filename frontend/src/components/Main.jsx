import React, { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import exportingInit from "highcharts/modules/exporting";
import exportDataInit from "highcharts/modules/export-data";
import HighchartsReact from "highcharts-react-official";
import InfoModal from "./InfoModal";
import api from "../api";

try {
  exportingInit(Highcharts);
  exportDataInit(Highcharts);
} catch (e) {
  void e;
}

const Main = ({ language = "GE", setLanguage = () => {} }) => {
  const [startYear, setStartYear] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [amount, setAmount] = useState("100");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRef = useRef(null);
  const [menuState, setMenuState] = useState({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    calculateIndex();
  }, [startYear, startMonth, endYear, endMonth]);

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

  const computedAmount = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 0;
    return (numericAmount * 1.0556).toFixed(2);
  };

  async function calculateIndex() {
    if (!startYear || !startMonth || !endYear || !endMonth) return;

    const start_date = await api.get(`/cpiindexes/${startYear}/${startMonth}`);
    const end_date = await api.get(`/cpiindexes/${endYear}/${endMonth}`);

    const index_start_date = start_date.data[0].Index;
    const index_end_date = end_date.data[0].Index;

    var calculated = ((index_end_date / index_start_date) * 100 - 100).toFixed(
      2
    );
  }

  // Highcharts options
  const chartOptions = {
    chart: {
      backgroundColor: "transparent",
    },

    credits: {
      enabled: false,
    },

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

    accessibility: {
      point: {
        valueDescriptionFormat: "{xDescription}{separator}{value} million(s)",
      },
    },

    xAxis: {
      title: {
        text: "",
        style: {
          fontSize: "15px",
          fontFamily: "bpg_mrgvlovani_caps",
          color: "#333333",
        },
      },
      categories: [1995, 2000, 2005, 2010, 2015, 2020, 2023],
      labels: {
        style: {
          fontSize: "11px",
          fontFamily: "bpg_mrgvlovani_caps",
          color: "#333333",
        },
      },
    },

    yAxis: {
      type: "logarithmic",
      title: {
        text: language === "GE" ? "პროცენტი (%)" : "Percent (%)",
        style: {
          fontSize: "12px",
          fontFamily: "bpg_mrgvlovani_caps",
          color: "#333333",
        },
      },
      labels: {
        style: {
          fontSize: "11px",
          fontFamily: "bpg_mrgvlovani_caps",
          color: "#333333",
        },
      },
    },

    tooltip: {
      headerFormat: "{series.name}: ",
      pointFormat: "<b>{point.y}%</b>",
      style: {
        fontSize: "11px",
        fontFamily: "bpg_mrgvlovani_caps",
        color: "#333333",
      },
    },

    legend: {
      itemStyle: {
        fontSize: "15px",
        fontFamily: "bpg_mrgvlovani_caps",
        color: "#333333",
      },
    },

    series: [
      {
        name:
          language === "GE"
            ? "სამომხმარებლო ფასების ინდექსის ცვლილება"
            : "Consumer Price Index change",
        data: [0, 0, 0, 0, 0, 0, 0],
        color: "var(--highcharts-color-1, #2caffe)",
      },
    ],
  };

  return (
    <section
      className="bg-white shadow-md bpg_mrgvlovani_caps w-full"
      style={{ border: "1px solid #01389c" }}
    >
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Header */}
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
            <>
              <p className="mb-2 font-semibold text-center">
                {language === "GE" ? "შედეგი:" : "Result:"}
              </p>
              <p className="mb-2">
                სამომხმარებლო ფასების ინდექსის ცვლილებამ {endYear} წლის{" "}
                {months[endMonth - 1]}ში {startYear} წლის{" "}
                {months[startMonth - 1]}თან შედარებით შეადგინა 5.56 %.
              </p>
              <p className="mb-2">
                {amount} ლარი {months[startMonth - 1]}ს {startYear} წლის
                მდგომარეობით, ინფლაციის გათვალისწინებით, {months[endMonth - 1]}ს{" "}
                {endYear} წელს შეადგენს {computedAmount()} ლარს.
              </p>
              <p className="text-gray-500 text-xs">
                {" "}
                {language === "GE"
                  ? "შენიშვნა: საბოლოო პერიოდი მონაწილეობს გაანგარიშებაში."
                  : "Note: the end period participates in calculation."}
              </p>
            </>
          ) : (
            <p>
              {" "}
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
          </span>{" "}
          <span>
            {" "}
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

      {/* Highcharts — Instruction ქვემოთ */}
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
        />
      </div>

      {isModalOpen && (
        <InfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          language={language}
        />
      )}
    </section>
  );
};

export default Main;

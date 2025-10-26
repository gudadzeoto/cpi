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

const Main = () => {
  const [startYear, setStartYear] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [amount, setAmount] = useState("100");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [language] = useState("GE");
  const chartRef = useRef(null);
  const [menuState, setMenuState] = useState({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    calculateIndex();
  }, [startYear, startMonth, endYear, endMonth]);


  const months = [
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

    var calculated = ((index_end_date / index_start_date) * 100 - 100).toFixed(2);
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
      text: "სამომხმარებლო ფასების ინდექსის ცვლილება საბაზო (საწყის) პერიოდთან შედარებით",
      style: {
        fontSize: "15px",
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
        text: "პროცენტი%",
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
        name: "სამომხმარებლო ფასების ინდექსის ცვლილება",
        data: [16, 361, 1018, 2025, 3192, 4673, 5200],
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
            <h3 className="text-lg md:text-xl font-semibold text-[#003366]">
              დროის პერიოდი
            </h3>
          </div>

          {/* Start */}
          <div className="flex items-center gap-7">
            <label className="text-red-600 font-semibold w-[80px] text-[14px]">
              საწყისი:
            </label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled hidden>აირჩიეთ წელი</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled hidden>აირჩიეთ თვე</option>
              {months.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* End */}
          <div className="flex items-center gap-7">
            <label className="text-red-600 font-semibold w-[80px] text-[14px]">
              სასრული:
            </label>
            <select
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled hidden>აირჩიეთ წელი</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-[170px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled hidden>აირჩიეთ თვე</option>
              {months.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-7">
            <label className="text-red-600 font-semibold w-[80px] text-[14px]">
              თანხა:
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-[370px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-right"
            />
          </div>
        </div>

        {/* Right Side — Result */}
        <div className="flex-1 bg-gray-50 border border-gray-300 rounded-md p-4 text-sm text-gray-700">
          {!isValidPeriod() ? (
            <p className="text-red-600 font-semibold">
              საბოლოო პერიოდი უნდა აღემატებოდეს საწყის პერიოდს.
            </p>
          ) : startYear && startMonth && endYear && endMonth && amount ? (
            <>
              <p className="mb-2 font-semibold text-center">შედეგი:</p>
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
                შენიშვნა: საბოლოო პერიოდი მონაწილეობს გაანგარიშებაში.
              </p>
            </>
          ) : (
            <p>აირჩიეთ დროის პერიოდები და თანხა შედეგის სანახავად.</p>
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
          <span>გაანგარიშების ინსტრუქცია</span>{" "}
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
      <div
        className="bg-white p-4 rounded-md relative"
        onContextMenu={(e) => {
          // show custom context menu only when right-clicking inside this container
          e.preventDefault();
          setMenuState({ visible: true, x: e.clientX, y: e.clientY });
        }}
        onClick={() => {
          // hide menu on regular click
          if (menuState.visible) setMenuState({ ...menuState, visible: false });
        }}
      >
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
        />

        {/* Custom context menu */}
        {menuState.visible && (
          <ul
            style={{
              position: "fixed",
              top: menuState.y,
              left: menuState.x,
              background: "white",
              border: "1px solid #ccc",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              listStyle: "none",
              padding: "6px 0",
              margin: 0,
              zIndex: 10000,
              minWidth: 180,
              fontFamily: "bpg_mrgvlovani_caps",
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <li
              style={{ padding: "6px 12px", cursor: "pointer" }}
              onClick={() => {
                const chart = chartRef.current && chartRef.current.chart;
                if (chart && chart.exportChart) {
                  chart.exportChart({ type: "image/png" });
                }
                setMenuState({ ...menuState, visible: false });
              }}
            >
              Export PNG
            </li>
            <li
              style={{ padding: "6px 12px", cursor: "pointer" }}
              onClick={() => {
                const chart = chartRef.current && chartRef.current.chart;
                if (chart && chart.exportChartLocal) {
                  chart.exportChartLocal({ type: "image/svg+xml" });
                } else if (chart && chart.exportChart) {
                  // fallback to server export if local not available
                  chart.exportChart({ type: "image/svg+xml" });
                }
                setMenuState({ ...menuState, visible: false });
              }}
            >
              Export SVG
            </li>
            <li
              style={{ padding: "6px 12px", cursor: "pointer" }}
              onClick={() => {
                const chart = chartRef.current && chartRef.current.chart;
                if (chart && chart.print) chart.print();
                setMenuState({ ...menuState, visible: false });
              }}
            >
              Print chart
            </li>
            <li
              style={{ padding: "6px 12px", cursor: "pointer" }}
              onClick={() => {
                const chart = chartRef.current && chartRef.current.chart;
                if (chart && chart.series && chart.series.length > 0) {
                  chart.series.forEach((s) => s.setVisible(!s.visible, false));
                  chart.redraw();
                }
                setMenuState({ ...menuState, visible: false });
              }}
            >
              Toggle series visibility
            </li>
            <li
              style={{ padding: "6px 12px", cursor: "pointer" }}
              onClick={() => {
                const chart = chartRef.current && chartRef.current.chart;
                if (chart && chart.resetZoomButton) chart.zoomOut();
                else if (chart) chart.zoomOut();
                setMenuState({ ...menuState, visible: false });
              }}
            >
              Reset zoom
            </li>
          </ul>
        )}
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

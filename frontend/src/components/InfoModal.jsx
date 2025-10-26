import React, { useEffect } from "react";

const InfoModal = ({ isOpen, onClose, language }) => {
  const handlePrint = () => {
    // Create a new hidden iframe
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    // Get the content to print
    const contentToPrint = document
      .getElementById("modal-content")
      .cloneNode(true);

    // Remove the buttons from the clone
    const buttons = contentToPrint.querySelectorAll("button, .print\\:hidden");
    buttons.forEach((button) => button.remove());

    // Write the content to the iframe
    const frameDoc = printFrame.contentWindow.document;
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${
            language === "GE" ? "ფასების კალეიდოსკოპი" : "SPRICE KALEIDOSCOPE"
          }</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            p { margin-bottom: 1em; line-height: 1.5; }
            .font-bold { font-weight: bold; }
            .mt-4 { margin-top: 1.5em; }
            a { color: #2563eb; text-decoration: underline; }
          </style>
        </head>
        <body>
          ${contentToPrint.innerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    // Print and remove the iframe
    printFrame.contentWindow.onafterprint = () => {
      document.body.removeChild(printFrame);
    };

    printFrame.contentWindow.print();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (event.target.classList.contains("modal-backdrop")) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="modal-content">
          <div className="border-b p-4 flex justify-between items-center">
            <h5 className="text-xl font-bold bpg_mrgvlovani_caps">
              {language === "GE"
                ? "როგორ მუშაობს სამომხმარებლო ფასების ინდექსის კალკულატორი"
                : "How Does the Salary Calculator Work"}
            </h5>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl print:hidden cursor-pointer font-bpg-nino"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="p-6 bpg_mrgvlovani_caps">
            {language === "GE" ? (
              <>
                <p>
                  სამომხმარებლო ფასების ინდექსის კალკულატორის დახმარებით
                  შესაძლებელია მომხმარებლისთვის სასურველი პერიოდისთვის ინდექსის
                  საერთო ცვლილების გაანგარიშება. გარდა ამისა, კალკულატორი იძლევა
                  ინფლაციის გათვალისწინებით თანხების გაანგარიშების საშუალებას.
                  გასული პერიოდის თანხების ინფლაციის გათვალისწინებით
                  გაანგარიშებისთვის კალკულატორი იყენებს ჯაჭვურად გადაბმული
                  ყოველთვიური ოფიციალური სამომხმარებლო ფასების ინდექსის
                  მნიშვნელობებს.
                </p>
                <p className="font-bold mt-4">შევსების ეტაპები:</p>
                <p className="font-bold mt-4">1. აირჩიეთ დროითი პერიოდი</p>
                <p>
                  ინფლაციის გათვალისწინებით თანხის გაანგარიშებისთვის, პირველ
                  რიგში, აუცილებელია მიუთითოთ საწყისი და საბოლოო დროის პერიოდი.
                  საწყისი პერიოდი გულისხმობს იმ პერიოდს, რომელსაც ეკუთვნის
                  გასაანგარიშებელი თანხა, ხოლო საბოლოო პერიოდი - იმ პერიოდს,
                  რომლის მდგომარეობითაც გსურთ თანხის გაანგარიშება (საბოლოო
                  პერიოდი მონაწილეობს გაანგარიშებაში).
                </p>
                <p className="font-bold mt-4">2. მიუთითეთ თანხა</p>
                <p>
                  შესაბამის ველში ჩაწერეთ თანხის ოდენობა, რომლის გაანგარიშებაც
                  გსურთ წინა ეტაპზე არჩეული პერიოდის მდგომარეობით.
                </p>
                <p className="font-bold mt-4">3. შედეგების ინტერპრეტაცია</p>
                <p>
                  მონაცემების შეყვანის შემდეგ მიიღებთ შემდეგ ინფორმაციას: a.
                  არჩეული დროითი პერიოდისთვის სამომხმარებლო ფასების ინდექსის
                  საერთო ცვლილებას; b. ინფლაციის, ასევე სახელმწიფო ვალუტის
                  ერთეულის ცვლილების გათვალისწინებით, მითითებული თანხის
                  ღირებულებას არჩეული დროითი პერიოდის მდგომარეობით; c. არჩეულ
                  საწყის პერიოდთან შედარებით ინფლაციის მაჩვენებლის დინამიკას,
                  გრაფიკის სახით.
                </p>
              </>
            ) : (
              <>
                <p>
                  The Price Kaleidoscope is a chart representing the inflation
                  rate by product and service groups and subgroups (according to
                  COICOP), as well as their weights in the consumer basket.
                </p>
                <p className="font-bold mt-4">
                  Using the Price Kaleidoscope, you can:
                </p>
                <ul>
                  <li>
                    Compare the rate of price change across different product
                    and service subgroups;
                  </li>
                  <li>
                    Compare the relative importance of individual subgroups in
                    forming the inflation rate – their weights in the consumer
                    basket.
                  </li>
                </ul>
                <p className="font-bold mt-4">Instructions</p>
                <p className="font-bold mt-4">1. Select a time period</p>
                <p>
                  Choose the year and month for which you want to analyze the
                  inflation rate.
                </p>
                <p className="font-bold mt-4">2. Specify the base period</p>
                <p>
                  Choose one of the two base periods (inflation compared to the
                  previous month or the same month of the previous year).
                </p>
                <p className="font-bold mt-4">3. Interpreting the results</p>
                <p>
                  Each segment of the chart reflects the weight of a product or
                  service subgroup in the consumer basket and the percentage
                  change in price compared to the selected base period. Hovering
                  over a segment shows the following information about that
                  subgroup:
                </p>
                <br />
                <ul>
                  <li>Name of the subgroup</li>
                  <li>Percentage change in price for the subgroup</li>
                  <li>Weight of the subgroup in the consumer basket</li>
                </ul>
                <br />
                <p>
                  The area of a segment reflects the weight of the subgroup in
                  the consumer basket. The larger the area of a sector, the more
                  important the subgroup is in forming the inflation rate. The
                  color coding of segments represents the extent of price change
                  according to the scale below the chart.
                </p>
              </>
            )}
          </div>
          <div className="border-t p-4 flex justify-end gap-2 print:hidden">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-bpg-nino cursor-pointer"
              onClick={handlePrint}
            >
              {language === "GE" ? "ბეჭდვა" : "Print"}
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-bpg-nino cursor-pointer"
              onClick={onClose}
            >
              {language === "GE" ? "დახურვა" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;

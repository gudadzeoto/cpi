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
            language === "GE" ? "სამომხმარებლო ფასების ინდექსის კალკულატორი" : "Consumer Price Index Calculator"
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
                : "How does the Consumer Price Index calculator work"}
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
                  მონაცემების შეყვანის შემდეგ მიიღებთ შემდეგ ინფორმაციას:
                </p>
                <br />
                <ul>
                  <li>
                    a. არჩეული დროითი პერიოდისთვის სამომხმარებლო ფასების
                    ინდექსის საერთო ცვლილებას;
                  </li>
                  <li>
                    b. ინფლაციის, ასევე სახელმწიფო ვალუტის ერთეულის ცვლილების
                    გათვალისწინებით, მითითებული თანხის ღირებულებას არჩეული
                    დროითი პერიოდის მდგომარეობით;
                  </li>
                  <li>
                    c. არჩეულ საწყის პერიოდთან შედარებით ინფლაციის მაჩვენებლის
                    დინამიკას, გრაფიკის სახით.
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  Consumer Price Index Calculator enables users to calculate a
                  total change in the index for a desirable period. It also
                  makes possible indexation of a particular amount of money
                  according to inflation.
                </p>
                <p className="font-bold mt-4"></p>
                <ul>
                  <li>
                    For calculation of amount of money from previous periods the
                    calculator uses monthly chained official Consumer Price
                    Indices.
                  </li>
                </ul>
                <p className="font-bold mt-4">Filling in steps</p>
                <p className="font-bold mt-4">1. Choose a time period</p>
                <p>
                  In order to use the calculator for indexation purposes first
                  you should indicate the start and end time periods. The start
                  period (“from”) corresponds to the period to which the amount
                  belongs, whereas the end period (“to”) corresponds to a period
                  for which you would like to calculate the amount (the end
                  period participates in calculation).
                </p>
                <p className="font-bold mt-4">2. Indicate the money amount</p>
                <p>
                  In the corresponding cell enter an amount of money that you
                  are interested to calculate for a chosen period.
                </p>
                <p className="font-bold mt-4">3. Interpretation of results</p>
                <p>
                  After filling in corresponding cells you will obtain following
                  information:
                </p>
                <br />
                <ul>
                  <li>a. Total change in the index for a chosen period;</li>
                  <li>
                    b. The amount of money as of the end of chosen period,
                    taking into consideration inflation and change of currency
                    units;
                  </li>
                  <li>
                    c. Graph expressing the dynamics of inflation rate compared
                    to the chosen start period.
                  </li>
                </ul>
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

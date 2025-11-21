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
            language === "GE"
              ? "სამომხმარებლო ფასების ინდექსის კალკულატორი"
              : "Consumer Price Index Calculator"
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
            <div
              className="flex"
              style={{ justifyContent: "space-around", width: "100%" }}
            >
              <img
                className="modal_geostat"
                src="https://www.geostat.ge/img/geostat.svg"
                alt="geostat logo"
                style={{ width: "30%" }}
              />
              <img
                className="modal_Sida"
                src="https://www.geostat.ge/img/Sida.svg"
                alt="Sida logo"
                style={{ width: "20%" }}
              />
              <img
                className="modal_UNDP"
                src="https://www.geostat.ge/img/UNDP_logo.svg"
                alt="UNDP logo"
                style={{ width: "8%" }}
              />
            </div>
          </div>

          <div className="p-6 bpg_mrgvlovani_caps">
            {language === "GE" ? (
              <>
                <p>
                  ვებგვერდის ადაპტირებული ვერსია შეზღუდული შესაძლებლობის მქონე
                  პირებისთვის შექმნილია საქართველოს სტატისტიკის ეროვნული
                  სამსახურის (საქსტატი) მიერ გაეროს განვითარების პროგრამისა
                  (UNDP) და შვედეთის მთავრობის ხელშეწყობით.
                </p>
              </>
            ) : (
              <>
                <p>
                  The adapted version of the website for people with
                  disabilities was developed by the National Statistics Office
                  of Georgia (Geostat) with the support of the United Nations
                  Development Program (UNDP) and the Government of Sweden.
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

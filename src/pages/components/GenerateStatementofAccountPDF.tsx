import React from 'react';
import { jsPDF } from 'jspdf';

// Define the type for permitData
interface PermitData {

  environmental?: string;  // Optional field for environmental info
}

interface GeneratePDFProps {
  permitData: PermitData | null;
}

const GenerateStatementofAccountPDF: React.FC<GeneratePDFProps> = ({ permitData  }) => {
    if (!permitData) {
        return <p>No permit data available</p>;  // Fallback message if permitData is not passed correctly
      }
  const generatePDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Add a title to the PDF
    doc.setFontSize(16);
    doc.text("Business Permit Details", 20, 20);

    // Add dynamic data from the permitData prop
    doc.setFontSize(12);

    // Add more data if needed
    // Example: if permitData contains environmental info
    if (permitData?.environmental) {
      doc.text(`Environmental: ${permitData.environmental}`, 20, 70);
    }

    // Save the PDF with a filename
    doc.save('business-permit-details.pdf');
  };

  return (
    <div>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
};

export default GenerateStatementofAccountPDF;

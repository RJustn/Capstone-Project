import React from 'react';
import { jsPDF } from 'jspdf';

interface PermitData {
  mayorspermit?: string;
  sanitary?: string;
  health?: string;
  businessplate?: string;
  zoningclearance?: string;
  annualInspection?: string;
  miscfee?: string;
  liquortobaco?: string;
  liquorplate?: string;
  total?: string;
  environmental?: string;
}

interface BusinessPermitContent {
  owner: {
    lastname: string;
    firstname: string;
  };
  id: string;
  business: {
    paymentmethod: string;
  };
}

interface GeneratePDFProps {
  permitData: PermitData | null;
  receiptId: string;
  businessPermitContent: BusinessPermitContent;
}

const GenerateStatementofAccountPDF: React.FC<GeneratePDFProps> = ({
  permitData,
  receiptId,
  businessPermitContent,
}) => {
  if (!permitData) {
    return <p>No permit data available</p>;
  }

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Business Permit details', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    let y = 35;

    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
    y += 8;
    doc.text(`Receipt ID: BP-${receiptId}`, 20, y);
    y += 8;
    doc.text(
      `Business Owner: ${businessPermitContent.owner.lastname} ${businessPermitContent.owner.firstname}`,
      20,
      y
    );
    y += 8;
    doc.text(`Business Permit ID: ${businessPermitContent.id}`, 20, y);
    y += 8;
    doc.text(
      `Mode of Payment: ${businessPermitContent.business.paymentmethod}`,
      20,
      y
    );
    y += 12;

    // Add each fee if present
    const addLine = (label: string, value?: number | string) => {
      if (value !== undefined && value !== null && value !== '') {
        doc.text(
          `${label}: ${typeof value === 'number' ? `PHP ${value}` : value}`,
          20,
          y
        );
        y += 8;
      }
    };

    addLine("Mayor's Permit Fee", permitData.mayorspermit);
    addLine('Sanitary Fee', permitData.sanitary);
    addLine('Health Fee', permitData.health);
    addLine('Business Plate Fee', permitData.businessplate);
    addLine('Zoning Clearance Fee', permitData.zoningclearance);
    addLine('Annual Inspection Fee', permitData.annualInspection);
    addLine('Miscellaneous Fee', permitData.miscfee);
    addLine('Environmental Fee', permitData.environmental);
    addLine('Liquor/Tobacco Fee', permitData.liquortobaco);
    addLine('Liquor Plate Fee', permitData.liquorplate);

    y += 4;
    doc.setFontSize(14);
    if (permitData.total !== undefined && permitData.total !== null) {
      doc.text(`Total Amount: PHP ${permitData.total}`, 20, y);
    }

    doc.save('statement-of-account.pdf');
  };

  return (
    <div>
      <button onClick={generatePDF}>Generate Details</button>
    </div>
  );
};

export default GenerateStatementofAccountPDF;
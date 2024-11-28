import React from 'react';

interface Permit {
  _id: string;
  id: string;
  workpermitstatus: string;
  classification: string;
  applicationdateIssued: string;
  permitExpiryDate?: string;
}

interface WorkPermitTables {
  permits: Permit[];
  openModal: (permit: Permit) => void;
}

const WorkPermitTable: React.FC<WorkPermitTables> = ({ permits, openModal }) => {
  return (
    <div className="workpermittable">
      <p>Work Permit Applications</p>
      <table className="permit-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Transaction</th>
            <th>Date Issued</th>
            <th>Date Expired</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {permits.map((permit) => (
            <tr key={permit._id}>
              <td>{permit.id}</td>
              <td>{permit.workpermitstatus}</td>
              <td>{permit.classification}</td>
              <td>{new Date(permit.applicationdateIssued).toLocaleDateString()}</td>
              <td>
                {permit.permitExpiryDate
                  ? new Date(permit.permitExpiryDate).toLocaleDateString()
                  : '---'}
              </td>
              <td>
                <button onClick={() => openModal(permit)} className="table-button">
                  Choose Action
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkPermitTable;

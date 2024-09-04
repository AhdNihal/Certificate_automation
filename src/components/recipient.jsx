import React from 'react';

export function RecipientList({ recipients, selectedRecipient }) {
  return (
    <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Select Recipient</label>
  <select 
    value={selectedRecipient} 
    onChange={(e) => setSelectedRecipient(e.target.value)}
    className="block w-full mt-1 rounded-md border-gray-300 shadow-sm"
    disabled={!recipients.length} // Disable if no recipients
  >
    <option value="">-- Select a Recipient --</option>
    {recipients && recipients.length > 0 ? (
      recipients.map((recipient, index) => (
        <option key={index} value={recipient.name}>{recipient.name}</option>
      ))
    ) : (
      <option disabled>No recipients available</option>
    )}
  </select>
</div>
  );
}
"use client"

import React from 'react';

interface SimpleDropdownProps {
  onSelect: (value: string) => void;
  options: { value: string; label: string }[];
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({ onSelect, options }) => {
  return (
    <select onChange={(e) => onSelect(e.target.value)} className="rounded border-gray-300 shadow-sm">
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SimpleDropdown;

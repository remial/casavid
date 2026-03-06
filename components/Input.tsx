import React from "react";

interface InputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
}

// Correct definition using React.forwardRef
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ value, onChange, onBlur, onKeyDown, className, placeholder }, ref) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
      ref={ref} // Forwarding the ref to the input element
    />
  ),
);

Input.displayName = 'Input';

export { Input };

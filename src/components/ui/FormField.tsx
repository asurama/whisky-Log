'use client';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required = false, children, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
}

export function Input({ label, required, className = '', ...props }: InputProps) {
  const inputElement = (
    <input
      {...props}
      className={`
        w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200
        bg-gray-700 border-gray-600 text-white placeholder-gray-400
        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        disabled:bg-gray-800 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );

  if (label) {
    return (
      <FormField label={label} required={required}>
        {inputElement}
      </FormField>
    );
  }

  return inputElement;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Select({ label, required, children, className = '', ...props }: SelectProps) {
  const selectElement = (
    <select
      {...props}
      className={`
        w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200
        bg-gray-700 border-gray-600 text-white
        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        disabled:bg-gray-800 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </select>
  );

  if (label) {
    return (
      <FormField label={label} required={required}>
        {selectElement}
      </FormField>
    );
  }

  return selectElement;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
}

export function Textarea({ label, required, className = '', ...props }: TextareaProps) {
  const textareaElement = (
    <textarea
      {...props}
      className={`
        w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200 resize-vertical
        bg-gray-700 border-gray-600 text-white placeholder-gray-400
        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        disabled:bg-gray-800 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );

  if (label) {
    return (
      <FormField label={label} required={required}>
        {textareaElement}
      </FormField>
    );
  }

  return textareaElement;
} 
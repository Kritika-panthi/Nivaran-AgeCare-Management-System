import React from "react";

type InputProps = {
  label: string;
  name: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  placeholder?: string;
};

export const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  inputMode,
  pattern,
  placeholder,
}: InputProps) => (
  <div>
    <label
      htmlFor={name}
      className="block text-xs font-semibold tracking-wide mb-2"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      inputMode={inputMode}
      pattern={pattern}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4b5244]"
    />
  </div>
);

type TextareaProps = {
  label: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export const Textarea = ({
  label,
  name,
  value,
  onChange,
}: TextareaProps) => (
  <div>
    <label
      htmlFor={name}
      className="block text-xs font-semibold tracking-wide mb-2"
    >
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      rows={4}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4b5244]"
    />
  </div>
);

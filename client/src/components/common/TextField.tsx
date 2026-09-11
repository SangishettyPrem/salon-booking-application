import React from "react";

export interface TextFieldProps {
  id?: string;
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  error?: string | false | null;
  touched?: boolean;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  helperText?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  readOnly?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  inputMode?:
    | "text"
    | "none"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
}

const TextField = ({
  id,
  name,
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  multiline = false,
  rows = 4,
  disabled = false,
  className = "",
  containerClassName = "",
  helperText,
  autoComplete,
  maxLength,
  minLength,
  inputMode,
  readOnly,
  startAdornment,
  endAdornment,
}: TextFieldProps) => {
  const inputId = id || name;
  const isTextarea = multiline || type === "textarea";
  const hasError = Boolean(touched !== undefined ? touched && error : error);
  const errorMessage =
    hasError && typeof error === "string" ? error : undefined;

  const paddingClasses = isTextarea
    ? "px-3.5 py-3"
    : `${startAdornment ? "pl-10 " : "pl-3.5 "} ${endAdornment ? "pr-10 " : "pr-3.5 "} py-3`;

  const baseInputStyles =
    `w-full rounded-lg border bg-(--surface) ${paddingClasses} text-sm text-(--ink) outline-none transition focus:border-(--rose) focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--rose)_13%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 ${
      hasError ? "border-red-400" : "border-(--line)"
    } ${className}`.trim();

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${containerClassName}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-(--ink)">
          {label}
          {required && <span className="text-(--rose)"> *</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={`resize-y ${baseInputStyles}`}
        />
      ) : (
        <div className="relative flex items-center w-full">
          {startAdornment && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted) flex items-center justify-center pointer-events-none">
              {startAdornment}
            </div>
          )}

          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            maxLength={maxLength}
            minLength={minLength}
            inputMode={inputMode}
            aria-invalid={hasError}
            readOnly={readOnly}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={baseInputStyles}
          />

          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {endAdornment}
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {errorMessage}
        </p>
      )}

      {!errorMessage && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-(--muted)">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default TextField;

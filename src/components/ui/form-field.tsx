import * as React from "react";
import { Label, FieldError } from "./field";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  // Clone single React element to inject id, aria-invalid, aria-describedby
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": ariaDescribedBy,
      })
    : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-1 font-medium">
          {label}
          {required && <span className="text-blaze font-bold">*</span>}
        </Label>
      )}
      {child}
      {description && (
        <p id={descriptionId} className="text-xs text-muted">
          {description}
        </p>
      )}
      <FieldError message={error} />
    </div>
  );
}

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface FileUploadProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: ReactNode;
  description?: ReactNode;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  function FileUpload(
    {
      className,
      description = "Click to upload · PNG, JPG, PDF",
      id,
      label = "Upload file",
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={classNames(
          "ui-file-upload",
          props.disabled && "ui-file-upload--disabled",
          className,
        )}
      >
        <input {...props} ref={ref} id={inputId} type="file" />
        <strong>{label}</strong>
        <span>{description}</span>
      </label>
    );
  },
);

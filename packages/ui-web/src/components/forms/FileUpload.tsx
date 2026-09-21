import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface FileUploadProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: ReactNode;
  description?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  function FileUpload(
    {
      className,
      description = "Click to upload · PNG, JPG, PDF",
      id,
      label = "Upload file",
      onRemove,
      removeLabel = "Remove file",
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="ui-file-upload-control">
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
        {onRemove && !props.disabled ? (
          <button
            className="ui-file-upload__remove"
            type="button"
            onClick={onRemove}
            aria-label={removeLabel}
          >
            Remove
          </button>
        ) : null}
      </div>
    );
  },
);

"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";

import { cn } from "@/lib/utils";
import { useAsRef } from "@/hooks/use-as-ref";
import { useDirection } from "@/components/ui/direction";
import { Button } from "@/components/ui/button";

const ROOT_NAME = "FileUpload";
const DROPZONE_NAME = "FileUploadDropzone";
const TRIGGER_NAME = "FileUploadTrigger";
const CLEAR_NAME = "FileUploadClear";

type Direction = "ltr" | "rtl";

interface FileUploadContextValue {
  inputId: string;
  dropzoneId: string;
  labelId: string;
  disabled: boolean;
  invalid: boolean;
  dragOver: boolean;
  dir: Direction;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setFile: (file: File | null) => void;
  setDragOver: (dragOver: boolean) => void;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(
  null
);

function useFileUploadContext(consumerName: string) {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function matchesAccept(file: File, acceptTypes: string[] | null): boolean {
  if (!acceptTypes) return true;
  const fileType = file.type;
  const fileExtension = `.${file.name.split(".").pop()}`;
  return acceptTypes.some(
    (type) =>
      type === fileType ||
      type === fileExtension ||
      (type.includes("/*") && fileType.startsWith(type.replace("/*", "/")))
  );
}

interface FileUploadProps
  extends Omit<
    React.ComponentProps<"div"> & useRender.ComponentProps<"div">,
    "defaultValue" | "onChange" | "value"
  > {
  value?: File | null;
  defaultValue?: File | null;
  onValueChange?: (file: File | null) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  onFileValidate?: (file: File) => string | null | undefined;
  accept?: string;
  maxSize?: number;
  dir?: Direction;
  label?: string;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

function FileUpload(props: FileUploadProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onFileAccept,
    onFileReject,
    onFileValidate,
    accept,
    maxSize,
    dir: dirProp,
    label,
    name,
    render,
    disabled = false,
    invalid: invalidProp = false,
    required = false,
    children,
    className,
    ...rootProps
  } = props;

  const inputId = React.useId();
  const dropzoneId = React.useId();
  const labelId = React.useId();

  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;

  const [internalFile, setInternalFile] = React.useState<File | null>(
    defaultValue ?? null
  );
  const [dragOver, setDragOver] = React.useState(false);
  const [validationInvalid, setValidationInvalid] = React.useState(false);

  const file = isControlled ? (value ?? null) : internalFile;
  const invalid = invalidProp || validationInvalid;

  const propsRef = useAsRef({
    onValueChange,
    onFileAccept,
    onFileReject,
    onFileValidate,
  });

  const acceptTypes = React.useMemo(
    () => accept?.split(",").map((t) => t.trim()) ?? null,
    [accept]
  );

  const setFile = React.useCallback(
    (next: File | null) => {
      if (!isControlled) setInternalFile(next);
      propsRef.current.onValueChange?.(next);
    },
    [isControlled, propsRef]
  );

  const flagInvalid = React.useCallback(() => {
    setValidationInvalid(true);
    const t = setTimeout(() => setValidationInvalid(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const onFilesChange = React.useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) return;
      const candidate = incoming[0];

      let rejection: string | null = null;
      const validationMessage = propsRef.current.onFileValidate?.(candidate);
      if (validationMessage) {
        rejection = validationMessage;
      } else if (!matchesAccept(candidate, acceptTypes)) {
        rejection = "File type not accepted";
      } else if (maxSize && candidate.size > maxSize) {
        rejection = "File too large";
      }

      if (rejection) {
        propsRef.current.onFileReject?.(candidate, rejection);
        flagInvalid();
        return;
      }

      setFile(candidate);
      propsRef.current.onFileAccept?.(candidate);
    },
    [disabled, propsRef, acceptTypes, maxSize, flagInvalid, setFile]
  );

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      onFilesChange(files);
      event.target.value = "";
    },
    [onFilesChange]
  );

  const contextValue = React.useMemo<FileUploadContextValue>(
    () => ({
      dropzoneId,
      inputId,
      labelId,
      dir,
      disabled,
      invalid,
      dragOver,
      file,
      inputRef,
      setFile,
      setDragOver,
    }),
    [
      dropzoneId,
      inputId,
      labelId,
      dir,
      disabled,
      invalid,
      dragOver,
      file,
      setFile,
    ]
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        dir,
        className: cn("relative flex flex-col gap-2", className),
        children: (
          <>
            {children}
            <input
              type="file"
              id={inputId}
              aria-labelledby={labelId}
              aria-describedby={dropzoneId}
              ref={inputRef}
              tabIndex={-1}
              accept={accept}
              name={name}
              className="sr-only"
              disabled={disabled}
              required={required}
              onChange={onInputChange}
            />
            <div id={labelId} className="sr-only">
              {label ?? "File upload"}
            </div>
          </>
        ),
      },
      rootProps
    ),
    render,
    state: {
      slot: "file-upload",
      disabled: disabled ? "" : undefined,
    },
  });

  return (
    <FileUploadContext.Provider value={contextValue}>
      {element}
    </FileUploadContext.Provider>
  );
}

interface FileUploadDropzoneProps
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {}

function FileUploadDropzone(props: FileUploadDropzoneProps) {
  const {
    render,
    className,
    onClick: onClickProp,
    onDragOver: onDragOverProp,
    onDragEnter: onDragEnterProp,
    onDragLeave: onDragLeaveProp,
    onDrop: onDropProp,
    onPaste: onPasteProp,
    onKeyDown: onKeyDownProp,
    ...dropzoneProps
  } = props;

  const context = useFileUploadContext(DROPZONE_NAME);

  const propsRef = useAsRef({
    onClick: onClickProp,
    onDragOver: onDragOverProp,
    onDragEnter: onDragEnterProp,
    onDragLeave: onDragLeaveProp,
    onDrop: onDropProp,
    onPaste: onPasteProp,
    onKeyDown: onKeyDownProp,
  });

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented) return;

      const target = event.target;
      const isFromTrigger =
        target instanceof HTMLElement &&
        target.closest('[data-slot="file-upload-trigger"]');

      if (!isFromTrigger) context.inputRef.current?.click();
    },
    [context.inputRef, propsRef]
  );

  const onDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragOver?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      context.setDragOver(true);
    },
    [context, propsRef]
  );

  const onDragEnter = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragEnter?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      context.setDragOver(true);
    },
    [context, propsRef]
  );

  const onDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragLeave?.(event);
      if (event.defaultPrevented) return;

      const relatedTarget = event.relatedTarget;
      if (
        relatedTarget &&
        relatedTarget instanceof Node &&
        event.currentTarget.contains(relatedTarget)
      ) {
        return;
      }

      event.preventDefault();
      context.setDragOver(false);
    },
    [context, propsRef]
  );

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      propsRef.current.onDrop?.(event);
      if (event.defaultPrevented) return;

      event.preventDefault();
      context.setDragOver(false);

      const files = Array.from(event.dataTransfer.files);
      const inputElement = context.inputRef.current;
      if (!inputElement || files.length === 0) return;

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    },
    [context]
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      propsRef.current.onPaste?.(event);
      if (event.defaultPrevented) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      let picked: File | null = null;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.kind === "file") {
          picked = item.getAsFile();
          if (picked) break;
        }
      }
      if (!picked) return;

      event.preventDefault();
      context.setDragOver(false);

      const inputElement = context.inputRef.current;
      if (!inputElement) return;

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(picked);
      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    },
    [context]
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      propsRef.current.onKeyDown?.(event);
      if (
        !event.defaultPrevented &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, propsRef]
  );

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "region",
        id: context.dropzoneId,
        "aria-controls": context.inputId,
        "aria-disabled": context.disabled,
        "aria-invalid": context.invalid,
        dir: context.dir,
        tabIndex: context.disabled ? undefined : 0,
        className: cn(
          "relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-disabled:pointer-events-none data-dragging:border-primary/30 data-invalid:border-destructive data-dragging:bg-accent/30 data-invalid:ring-destructive/20",
          className
        ),
        onClick,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop,
        onKeyDown,
        onPaste,
      },
      dropzoneProps
    ),
    render,
    state: {
      slot: "file-upload-dropzone",
      disabled: context.disabled ? "" : undefined,
      dragging: context.dragOver ? "" : undefined,
      invalid: context.invalid ? "" : undefined,
    },
  });
}

interface FileUploadTriggerProps
  extends React.ComponentProps<"button">,
    useRender.ComponentProps<"button"> {}

function FileUploadTrigger(props: FileUploadTriggerProps) {
  const { render, onClick: onClickProp, ...triggerProps } = props;

  const context = useFileUploadContext(TRIGGER_NAME);

  const propsRef = useAsRef({ onClick: onClickProp });

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented) return;
      context.inputRef.current?.click();
    },
    [context.inputRef, propsRef]
  );

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: "button",
        "aria-controls": context.inputId,
        disabled: context.disabled,
        onClick,
      },
      triggerProps
    ),
    render,
    state: {
      slot: "file-upload-trigger",
      disabled: context.disabled ? "" : undefined,
    },
  });
}

type FileUploadClearProps = React.ComponentProps<typeof Button> & {
  forceMount?: boolean;
};

function FileUploadClear(props: FileUploadClearProps) {
  const { forceMount, disabled, onClick: onClickProp, ...clearProps } = props;

  const context = useFileUploadContext(CLEAR_NAME);
  const isDisabled = disabled ?? context.disabled;

  const onClick: NonNullable<React.ComponentProps<typeof Button>["onClick"]> =
    React.useCallback(
      (event) => {
        onClickProp?.(event);
        if (event.defaultPrevented) return;
        context.setFile(null);
      },
      [context, onClickProp]
    );

  if (!(forceMount ?? context.file !== null)) return null;

  return (
    <Button
      type="button"
      aria-controls={context.inputId}
      disabled={isDisabled}
      onClick={onClick}
      {...clearProps}
    />
  );
}

export {
  FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  type FileUploadProps,
  FileUploadTrigger,
};

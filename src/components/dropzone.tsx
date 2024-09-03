"use client";

import { Accept, useDropzone } from "react-dropzone";

export function Dropzone({ onDrop }: { onDrop: (files: File[]) => void }) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({ accept, onDrop });

  return (
    <div
      className={`z-10 flex min-h-36 w-full items-center justify-center rounded border-2 border-dashed ${
        isDragActive ? "border-black" : "border-gray-400"
      } hover:cursor-pointer`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <p className="text-sm">Drop .heic images here.</p>
    </div>
  );
}

const accept: Accept = { "image/heif": [".heif"], "image/heic": [".heic"] };

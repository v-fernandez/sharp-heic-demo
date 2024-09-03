"use client";

import Image from "next/image";
import React from "react";
import { v4 as uuid } from "uuid";
import { Dropzone } from "~/components/dropzone";
import { Uploads, Upload } from "~/components/uploads";

export default function Demo() {
  const [files, setFiles] = React.useState<Record<string, Upload & { file: File }>>({});
  const [preview, setPreview] = React.useState<string | undefined>(undefined);

  const onDrop = React.useCallback(
    async (selected: File[]) => {
      const batch: Record<string, Upload & { file: File }> = selected.reduce(
        (files, file) => ({
          ...files,
          [uuid()]: { file, id: uuid(), name: file.name, status: "uploading" },
        }),
        {},
      );

      setFiles((files) => ({ ...files, ...batch }));

      for (const [id, value] of Object.entries(batch)) {
        const result = await uploadImage(value.file);

        setFiles((files) => ({ ...files, [id]: { ...files[id], ...result } }));
      }
    },
    [setFiles],
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-6 p-8 font-mono md:px-24 md:py-16">
      <p className="w-full font-bold">Sharp .heic image support demo</p>
      <Dropzone onDrop={onDrop} />

      <div className="flex w-full flex-col gap-8 md:flex-row">
        <Uploads files={Object.values(files)} onClick={setPreview} preview={preview} />
        <div className="overflow-hidden rounded">
          {preview !== undefined && <Image alt="preview" height={400} width={400} src={preview} />}
        </div>
      </div>
    </main>
  );
}

async function uploadImage(file: File): Promise<Partial<Upload>> {
  const formData = new FormData();

  // I don't know why but when clicking the file input and selecting a file through the dialog
  // the file gets uploaded with a `application/octet-stream` mime type.  This issue does not
  // happen when dropping files into the input.
  const blob = file.slice(0, file.size, "image/heic");
  const payload = new File([blob], file.name, { type: file.type });

  formData.append("file", payload);

  try {
    const response = await fetch("/api/upload", { method: "POST", body: formData });

    if (response.status !== 200) {
      return { name: file.name, status: "error" };
    }

    const data = (await response.json()) as unknown as { url: string };

    return { name: file.name, status: "done", url: data.url };
  } catch (error) {
    return { name: file.name, status: "error" };
  }
}

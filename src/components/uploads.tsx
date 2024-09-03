import { Spinner } from "./spinner";

export type Upload = {
  id: string;
  name: string;
  status: "uploading" | "error" | "done";
  url?: string;
};

export function Uploads({
  files,
  onClick,
  preview,
}: {
  files: Upload[];
  onClick: (url: string) => void;
  preview?: string;
}) {
  return (
    <div className="flextext-sm w-full max-w-full flex-col items-start overflow-hidden text-sm">
      <p className="font-bold">Files:</p>
      <ul>
        {files.map((file) => (
          <li
            className={`flex cursor-default items-center gap-2 text-nowrap py-0.5 ${file.status === "done" ? "hover:cursor-pointer" : ""} `}
            onClick={file.status === "done" ? () => onClick(file.url!) : undefined}
            key={file.id}
          >
            <p className="py-1">
              -{" "}
              <span
                className={`truncate ${preview !== undefined && preview === file.url ? "text-blue-600 underline underline-offset-4" : ""}`}
              >
                {file.name}
              </span>
            </p>

            {file.status === "uploading" && (
              <div className="flex items-center gap-2 rounded-full bg-teal-200 px-4 py-1 text-xs">
                <Spinner />
                Uploading...
              </div>
            )}

            {file.status === "error" && (
              <div className="rounded-full bg-red-200 px-4 py-1 text-xs">Error</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuid } from "uuid";

const MAX_SIZE_PX = 2560;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

if (SUPABASE_ANON_KEY === "") {
  throw new Error("The NEXT_PUBLIC_SUPABASE_ANON_KEY env variable is required.");
}

if (SUPABASE_URL === "") {
  throw new Error("The NEXT_PUBLIC_SUPABASE_URL env variable is required.");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  if (!formData.has("file")) {
    return NextResponse.json({ message: "`formData.file` is required." }, { status: 400 });
  }

  const file = formData.get("file");

  if (typeof file === "string" || file === null) {
    return NextResponse.json(
      { message: "`formData.file` must be of type `File`." },
      { status: 400 },
    );
  }

  if (file.type !== "image/heic" && file.type !== "image/heif") {
    return NextResponse.json(
      { message: "`formData.file` must be a `image/heif` or `image/heic` file." },
      { status: 400 },
    );
  }

  let image = await sharp(await file.arrayBuffer());
  const metadata = await image.metadata();

  // Supabase Storage's image transformations appears to have a hard limit on the input image's
  // resolution.  Resize the image if necessary to avoid 422 unprocessable content errors fetching it.
  if ((metadata.width ?? 0) > MAX_SIZE_PX || (metadata.height ?? 0) > MAX_SIZE_PX) {
    image = image.resize({ width: MAX_SIZE_PX, height: MAX_SIZE_PX, fit: "inside" });
  }

  const jpeg = await image.jpeg().toBuffer();
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const bucket = "uploads";
  const path = `${uuid()}.jpg`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, jpeg, { contentType: "image/jpeg" });

  if (error !== null) {
    return NextResponse.json({ message: "Not OK" }, { status: 500 });
  }

  return NextResponse.json({
    url: `${SUPABASE_URL}/storage/v1/render/image/public/${bucket}/${path}`,
  });
}

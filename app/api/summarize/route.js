// app/api/summarize/route.js
import { buildChapterChunks } from "@/app/lib/summarize";

export async function POST(req) {
  // 1. take the uploaded file in from the browser
  const form = await req.formData();
  const file = form.get("file");

  // 2. convert it to bytes (the format the pipeline wants)
  const pdfBytes = new Uint8Array(await file.arrayBuffer());

  // 3. hand the bytes to your pipeline
  const result = await buildChapterChunks(pdfBytes);

  // 4. send the result back to the browser
  return Response.json(result);
}
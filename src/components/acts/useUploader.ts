import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { uploadFile } from "@/lib/acts.functions";
import { fileToB64, MAX_FILE_MB } from "@/lib/acts-data";

export function useUploader() {
  const up = useServerFn(uploadFile);
  const [busy, setBusy] = useState(0);
  const upload = async (f: File) => {
    if (f.size > MAX_FILE_MB * 1024 * 1024) throw new Error(`حجم الملف أكبر من ${MAX_FILE_MB} ميغابايت`);
    if (!/^(image\/|application\/pdf)/.test(f.type)) throw new Error("يُسمح بالصور وملفات PDF فقط");
    setBusy((n) => n + 1);
    try {
      return await up({ data: { file_name: f.name, mime: f.type, b64: await fileToB64(f) } });
    } finally {
      setBusy((n) => n - 1);
    }
  };
  return { upload, uploading: busy > 0 };
}

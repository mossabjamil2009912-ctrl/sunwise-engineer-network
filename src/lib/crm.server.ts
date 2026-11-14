// Server-only bridge to the ACTES CRM (https://actes-crm.lovable.app).
// The CRM exposes its ACTS actions as TanStack server functions; we call them server-to-server
// using the same wire format (seroval JSON) the CRM's own browser client uses.
import { createPlugin, fromCrossJSON, toJSONAsync, type SerovalNode } from "seroval";

export const CRM_URL = "https://actes-crm.lovable.app";

// Function ids of actes-crm src/lib/acts.functions.ts exports (stable while that file path and export names stay the same).
export const CRM_FN = {
  quoteRequest: "19539974ae87a7e3d0679c5e773c4b5a6e6d04b8ec26e9bc130712ec9ef8c76e",
  listEngineers: "48d6b5211d2245f014be7a83dd0181f1e66205b0e45b49e7f93c3c4e19bf3540",
  getEngineer: "1703d49f1cb202288301fff7623ba6405cef64eda4d36b3d34819ee9f7a5aeda",
  upload: "adf2bd291d5db186c882b2ea4111200438138d69c793cd21c65a20812faab470",
  register: "bdf40eb57438ece43a11fbdc2fd118ea48e3ad24c18f5fa7ca8afb997b48a790",
  serviceRequest: "7af9bdde5c6b1c8acd434d8233b56451f23fc1d6954395f8b0d1089686bfe24b",
  reviewInfo: "904edcc9130a09399cd473de8dc00df8fbaea5b242d67982dd87285ca55ff46a",
  submitReview: "4b19ece4d658584e78c2c031f13ad1becaf24e317f5563a1d6bca429500810a1",
  reportReview: "46377014edde85aed3a03176bef548927cca700f7b20cd8f959d0057e948b19e",
  kwhPrice: "37c8bb763fc7f258f64f9d36de0bdaded30df5bb544398f3b3ee634eba26df4c",
} as const;

const ErrorPlugin = createPlugin<Error, { message: SerovalNode }>({
  tag: "$TSR/Error",
  test: (v) => v instanceof Error,
  parse: {
    sync: (v, c) => ({ message: c.parse(v.message) }),
    async: async (v, c) => ({ message: await c.parse(v.message) }),
    stream: (v, c) => ({ message: c.parse(v.message) }),
  },
  serialize: (n, c) => "new Error(" + c.serialize(n.message) + ")",
  deserialize: (n, c) => new Error(String(c.deserialize(n.message))),
});
const plugins = [ErrorPlugin];

/** Turns CRM errors (often raw validation output) into a short Arabic message for the user. */
function friendly(msg: string) {
  const m = msg.trim();
  if (m.startsWith("[") || m.startsWith("{")) return "بعض البيانات غير مكتملة أو غير صحيحة، يرجى مراجعتها.";
  return m || "حدث خطأ غير متوقع";
}

export async function callCrm<T>(fn: keyof typeof CRM_FN, data?: unknown): Promise<T> {
  const body = JSON.stringify(await toJSONAsync(data === undefined ? {} : { data }, { plugins }));
  let res: Response;
  try {
    res = await fetch(`${CRM_URL}/_serverFn/${CRM_FN[fn]}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "x-tsr-serverFn": "true",
        origin: CRM_URL,
      },
      body,
    });
  } catch {
    throw new Error("تعذّر الاتصال بخادم أكتس، تحقق من الإنترنت وحاول مجدداً.");
  }
  let out: { result?: T; error?: unknown };
  try {
    out = fromCrossJSON(await res.json(), { plugins, refs: new Map(), disabledFeatures: 0 }) as typeof out;
  } catch {
    throw new Error("تعذّر الاتصال بخادم أكتس، حاول مجدداً بعد قليل.");
  }
  if (out.error !== undefined) {
    throw new Error(friendly(out.error instanceof Error ? out.error.message : String(out.error)));
  }
  return out.result as T;
}

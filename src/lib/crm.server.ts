// Server-only bridge to the ACTES CRM public endpoint. GET = catalog, POST {action, data} = actions.
export const CRM_BRIDGE_DEFAULT = "https://actes-crm.lovable.app/api/public/acts-bridge";
/** Permanent CRM endpoint; ACTES_CRM_BRIDGE env overrides it, otherwise the fixed URL is used. */
export const crmBridge = () => process.env['ACTES_CRM_BRIDGE']?.trim() || CRM_BRIDGE_DEFAULT;

const OFFLINE = "تعذّر الاتصال بخادم أكتس، تحقق من الإنترنت وحاول مجدداً.";

export async function getBridge<T>(): Promise<T> {
  let res: Response;
  try { res = await fetch(crmBridge(), { headers: { accept: "application/json" } }); } catch { throw new Error(OFFLINE); }
  if (!res.ok) throw new Error(OFFLINE);
  return (await res.json()) as T;
}

/** Calls a CRM action; the CRM's Arabic `error` is thrown unchanged so it reaches the user as-is. */
export async function callCrm<T>(action: string, data: unknown = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(crmBridge(), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ action, data }),
    });
  } catch { throw new Error(OFFLINE); }
  let out: { ok?: boolean; result?: T; error?: string };
  try { out = await res.json(); } catch { throw new Error(OFFLINE); }
  if (!out.ok) throw new Error(out.error || "حدث خطأ غير متوقع");
  return out.result as T;
}

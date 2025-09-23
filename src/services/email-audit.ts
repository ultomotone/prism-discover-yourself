const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send" as const;

type AuditEnv = {
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
};

function resolveEnv(): AuditEnv {
  const output: AuditEnv = {};
  const metaEnv = (typeof import.meta !== "undefined" ? ((import.meta as any).env ?? {}) : {}) as Record<string, unknown>;
  const nodeEnv = (typeof process !== "undefined" ? process.env ?? {} : {}) as Record<string, string | undefined>;

  output.serviceId =
    (metaEnv.VITE_EMAILJS_SERVICE_ID as string | undefined)?.trim() ||
    nodeEnv.VITE_EMAILJS_SERVICE_ID?.trim();

  output.templateId =
    (metaEnv.VITE_EMAILJS_TEMPLATE_ID as string | undefined)?.trim() ||
    nodeEnv.VITE_EMAILJS_TEMPLATE_ID?.trim();

  output.publicKey =
    (metaEnv.VITE_EMAILJS_PUBLIC_KEY as string | undefined)?.trim() ||
    nodeEnv.VITE_EMAILJS_PUBLIC_KEY?.trim();

  return output;
}

export type AuditEmailPayload = {
  subject: string;
  message: string;
  variables?: Record<string, unknown>;
};

async function sendAuditEmailDefault(payload: AuditEmailPayload): Promise<void> {
  const { serviceId, templateId, publicKey } = resolveEnv();

  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS not configured; skipping audit email", {
      hasServiceId: Boolean(serviceId),
      hasTemplateId: Boolean(templateId),
      hasPublicKey: Boolean(publicKey),
    });
    return;
  }

  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      subject: payload.subject,
      message: payload.message,
      ...(payload.variables ?? {}),
    },
  };

  try {
    const res = await fetch(EMAILJS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.warn("EmailJS audit failed", { status: res.status, body: errorText });
    }
  } catch (error) {
    console.warn("EmailJS audit request error", error instanceof Error ? error.message : error);
  }
}

type AuditImplementation = (payload: AuditEmailPayload) => Promise<void>;

let implementation: AuditImplementation = sendAuditEmailDefault;

export function setAuditEmailImplementation(next: AuditImplementation | null): void {
  implementation = next ?? sendAuditEmailDefault;
}

export async function sendAuditEmail(payload: AuditEmailPayload): Promise<void> {
  await implementation(payload);
}

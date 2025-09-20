const textEncoder = new TextEncoder();

function normalizeInput(input: string): string {
  return input.trim().toLowerCase();
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function subtleDigest(data: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

async function nodeDigest(data: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(data, "utf8").digest("hex");
}

export async function sha256HexLower(input: string): Promise<string> {
  const normalized = normalizeInput(input);

  if (!normalized) {
    return "";
  }

  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      return await subtleDigest(textEncoder.encode(normalized));
    } catch (error) {
      if (typeof Deno !== "undefined") {
        throw error;
      }
    }
  }

  return nodeDigest(normalized);
}

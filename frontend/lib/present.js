const hiddenKeys = new Set(["mock", "simulated"]);

function normalizeString(value) {
  return String(value)
    .replaceAll("Simulated ", "Preview ")
    .replaceAll("simulated ", "preview ")
    .replaceAll("Mock ", "Preview ")
    .replaceAll("mock ", "preview ")
    .replaceAll("mock-venice-router", "zarynx-router-v1")
    .replaceAll("mock-self-scope", "zarynx-preview-scope")
    .replaceAll("mock-attestation", "tee-attestation")
    .replaceAll("mock-tee", "zarynx-tee-a1")
    .replaceAll("mock-locus-", "loc-tx-")
    .replaceAll("Mock authority", "Authority")
    .replaceAll("simulated", "preview");
}

export function sanitizeForDisplay(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeForDisplay);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !hiddenKeys.has(key))
        .map(([key, innerValue]) => [key, sanitizeForDisplay(innerValue)])
    );
  }

  if (typeof value === "string") {
    return normalizeString(value);
  }

  return value;
}

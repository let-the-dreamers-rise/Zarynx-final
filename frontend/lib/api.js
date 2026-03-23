const localhostHosts = new Set(["localhost", "127.0.0.1"]);

export function getBackendUrl() {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:4000";
  }

  return localhostHosts.has(window.location.hostname)
    ? "http://localhost:4000"
    : window.location.origin;
}

export async function fetcher(path) {
  const response = await fetch(`${getBackendUrl()}${path}`);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function postJson(path, payload) {
  const response = await fetch(`${getBackendUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

export function serializeForDisplay(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, innerValue) =>
      typeof innerValue === "bigint" ? innerValue.toString() : innerValue
    )
  );
}

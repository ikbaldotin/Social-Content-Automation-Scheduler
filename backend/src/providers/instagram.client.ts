import { MetaApiError } from "../types/instagram.type";

const META_GRAPH_URL = "https://graph.facebook.com";
const META_API_VERSION = "v25.0";

export class InstagramApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly metaError?: MetaApiError,
  ) {
    super(message);
    this.name = "InstagramApiError";
  }
}

const instagramRequest = async <T>(
  endPoint: string,
  accessToken: string,
  params: Record<string, string> = {},
): Promise<T> => {
  if (!accessToken) {
    throw new Error("Instagram access token is missing");
  }
  const url = new URL(
    `${META_GRAPH_URL}/${META_API_VERSION}/${endPoint.replace(/^\/+/, "")}`,
  );
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(15000),
  });
  const result = (await response.json()) as T & {
    error?: MetaApiError;
  };

  if (!response.ok || result.error) {
    throw new InstagramApiError(
      result.error?.message ?? "Instagram API request failed",
      response.status,
      result.error,
    );
  }
  return result;
};
const instagramPost = async <T>(
  endPoint: string,
  accessToken: string,
  params: Record<string, string>,
): Promise<T> => {
  if (!accessToken) {
    throw new Error("Instagram access token is missing");
  }
  const url = new URL(
    `${META_GRAPH_URL}/${META_API_VERSION}/${endPoint.replace(/^\/+/, "")}`,
  );
  const body = new URLSearchParams(params);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    signal: AbortSignal.timeout(30000),
  });
  const result = (await response.json()) as T & {
    error?: MetaApiError;
  };
  if (!response.ok || result.error) {
    throw new InstagramApiError(
      result.error?.message ?? "Instagram publishing request failed",
      response.status,
      result.error,
    );
  }
  return result;
};
export { instagramRequest, instagramPost };

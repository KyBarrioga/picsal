import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const apiClient = axios.create({
  baseURL: process.env.PICSAL_API_URL ?? "http://127.0.0.1:8000/api/",
  withCredentials: true,
});
const IAT_RETRY_DELAY_MS = 1200;
const IAT_RETRY_ATTEMPTS = 2;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "PATCH") {
    res.status(405).json({ message: "You have no permission to access this resource." });
    return;
  }

  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    res.status(401).json({ error: "Missing auth cookie." });
    return;
  }

  try {
    let response;

    if (req.method === "GET") {
      response = await fetchUserMeWithRefresh(cookieHeader);
    } else {
      const patchPayload = buildProfilePatchPayload(req.body);
      console.log("PATCH /api/user/me payload", patchPayload);
      response = await patchUserMeWithRefresh(cookieHeader, patchPayload);
    }

    forwardSetCookieHeaders(res, response.headers["set-cookie"]);

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(422).json({ error: error.message });
      return;
    }

    if (axios.isAxiosError(error) && error.response) {
      forwardSetCookieHeaders(res, error.response.headers["set-cookie"]);

      res.status(error.response.status).json(error.response.data);
      return;
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

function buildProfilePatchPayload(body: unknown) {
  const source = body && typeof body === "object" ? body : {};
  const displayName = "display_name" in source && typeof source.display_name === "string"
    ? source.display_name.trim()
    : "";
  const description = "description" in source && typeof source.description === "string"
    ? source.description.trim()
    : "";
  const profilePicture =
    "profile_picture" in source && typeof source.profile_picture === "string"
      ? source.profile_picture.trim()
      : "";

  if (!displayName) {
    const error = new Error("Display name is required.");
    error.name = "ValidationError";
    throw error;
  }

  return {
    display_name: displayName,
    description,
    profile_picture: profilePicture,
  };
}

async function fetchUserMeWithRefresh(cookieHeader: string) {
  try {
    return await fetchUserMeWithIatRetry(cookieHeader);
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw error;
    }

    const status = error.response.status;
    const detail = extractErrorDetail(error.response.data);
    const canRefresh =
      (status === 401 || status === 403) &&
      detail.toLowerCase().includes("authentication credentials");

    if (!canRefresh) {
      throw error;
    }

    const refreshResponse = await apiClient.post(
      "auth/refresh/",
      {},
      {
        headers: {
          Cookie: cookieHeader,
        },
        withCredentials: true,
      }
    );

    const refreshedCookieHeader = mergeCookieHeaders(
      cookieHeader,
      refreshResponse.headers["set-cookie"]
    );

    const userMeResponse = await fetchUserMeWithIatRetry(refreshedCookieHeader);

    userMeResponse.headers["set-cookie"] = [
      ...normalizeSetCookieHeaders(refreshResponse.headers["set-cookie"]),
      ...normalizeSetCookieHeaders(userMeResponse.headers["set-cookie"]),
    ];

    return userMeResponse;
  }
}

async function patchUserMeWithRefresh(
  cookieHeader: string,
  payload: {
    display_name: string;
    description: string;
    profile_picture: string;
  }
) {
  try {
    return await patchUserMeWithIatRetry(cookieHeader, payload);
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw error;
    }

    const status = error.response.status;
    const detail = extractErrorDetail(error.response.data);
    const canRefresh =
      (status === 401 || status === 403) &&
      detail.toLowerCase().includes("authentication credentials");

    if (!canRefresh) {
      throw error;
    }

    const refreshResponse = await apiClient.post(
      "auth/refresh/",
      {},
      {
        headers: {
          Cookie: cookieHeader,
        },
        withCredentials: true,
      }
    );

    const refreshedCookieHeader = mergeCookieHeaders(
      cookieHeader,
      refreshResponse.headers["set-cookie"]
    );

    const patchResponse = await patchUserMeWithIatRetry(refreshedCookieHeader, payload);

    patchResponse.headers["set-cookie"] = [
      ...normalizeSetCookieHeaders(refreshResponse.headers["set-cookie"]),
      ...normalizeSetCookieHeaders(patchResponse.headers["set-cookie"]),
    ];

    return patchResponse;
  }
}

async function fetchUserMeWithIatRetry(cookieHeader: string, retries = IAT_RETRY_ATTEMPTS) {
  try {
    return await apiClient.get("user/me/", {
      headers: buildAuthHeaders(cookieHeader),
      withCredentials: true,
    });
  } catch (error) {
    if (!shouldRetryForIat(error) || retries <= 0) {
      throw error;
    }

    await delay(IAT_RETRY_DELAY_MS);
    return fetchUserMeWithIatRetry(cookieHeader, retries - 1);
  }
}

async function patchUserMeWithIatRetry(
  cookieHeader: string,
  payload: {
    display_name: string;
    description: string;
    profile_picture: string;
  },
  retries = IAT_RETRY_ATTEMPTS
) {
  try {
    return await apiClient.patch("user/me/", payload, {
      headers: buildAuthHeaders(cookieHeader),
      withCredentials: true,
    });
  } catch (error) {
    if (!shouldRetryForIat(error) || retries <= 0) {
      throw error;
    }

    await delay(IAT_RETRY_DELAY_MS);
    return patchUserMeWithIatRetry(cookieHeader, payload, retries - 1);
  }
}

function buildAuthHeaders(cookieHeader: string) {
  const accessToken = getCookieValue(cookieHeader, "picsal_access_token");

  return {
    Cookie: cookieHeader,
    ...(accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : {}),
  };
}

function extractErrorDetail(data: unknown) {
  if (data && typeof data === "object" && "detail" in data && typeof data.detail === "string") {
    return data.detail;
  }

  return "";
}

function shouldRetryForIat(error: unknown) {
  if (!axios.isAxiosError(error) || !error.response) {
    return false;
  }

  const detail = extractErrorDetail(error.response.data).toLowerCase();
  return detail.includes("not yet valid") && detail.includes("(iat)");
}

function forwardSetCookieHeaders(
  res: NextApiResponse,
  setCookieHeader: string[] | string | undefined
) {
  const cookies = normalizeSetCookieHeaders(setCookieHeader);

  if (cookies.length > 0) {
    res.setHeader("Set-Cookie", cookies);
  }
}

function normalizeSetCookieHeaders(setCookieHeader: string[] | string | undefined) {
  if (!setCookieHeader) {
    return [] as string[];
  }

  return Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
}

function mergeCookieHeaders(
  originalCookieHeader: string,
  setCookieHeader: string[] | string | undefined
) {
  const cookieMap = new Map<string, string>();

  originalCookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return;
      }

      const name = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookieMap.set(name, value);
    });

  normalizeSetCookieHeaders(setCookieHeader).forEach((cookie) => {
    const [nameValuePair] = cookie.split(";");
    const separatorIndex = nameValuePair.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const name = nameValuePair.slice(0, separatorIndex).trim();
    const value = nameValuePair.slice(separatorIndex + 1).trim();
    cookieMap.set(name, value);
  });

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function getCookieValue(cookieHeader: string, cookieName: string) {
  for (const part of cookieHeader.split(";")) {
    const trimmedPart = part.trim();
    const separatorIndex = trimmedPart.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmedPart.slice(0, separatorIndex).trim();

    if (name !== cookieName) {
      continue;
    }

    return trimmedPart.slice(separatorIndex + 1).trim();
  }

  return "";
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

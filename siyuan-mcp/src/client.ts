interface SiYuanResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export class SiYuanError extends Error {
  constructor(
    message: string,
    readonly endpoint: string,
    readonly code?: number,
    readonly httpStatus?: number,
  ) {
    super(message);
    this.name = "SiYuanError";
  }
}

export class SiYuanClient {
  readonly baseUrl: string;
  readonly token: string;

  constructor(baseUrl: string, token: string) {
    if (!baseUrl) throw new Error("SIYUAN_BASE_URL is required");
    if (!token) throw new Error("SIYUAN_API_TOKEN is required");
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.token = token;
  }

  async post<T = unknown>(path: string, body: unknown = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${this.token}`,
        },
        body: JSON.stringify(body ?? {}),
      });
    } catch (err) {
      throw new SiYuanError(
        `Network error calling ${path}: ${(err as Error).message}`,
        path,
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new SiYuanError(
          `HTTP ${res.status} from ${path}: ${text.slice(0, 500)}`,
          path,
          undefined,
          res.status,
        );
      }
      // Some endpoints (e.g. /api/file/getFile) return raw bytes.
      return (await res.arrayBuffer()) as unknown as T;
    }

    const json = (await res.json()) as SiYuanResponse<T>;
    if (json.code !== 0) {
      throw new SiYuanError(
        `${path} returned code ${json.code}: ${json.msg || "(no message)"}`,
        path,
        json.code,
        res.status,
      );
    }
    return json.data;
  }
}

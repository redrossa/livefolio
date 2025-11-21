export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(keys: string[]): Promise<void>;
}

interface RedisConfig {
  url: string;
  token: string;
}

function getRedisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

async function runPipeline(
  config: RedisConfig,
  commands: Array<string[]>,
): Promise<void> {
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Redis pipeline failed: ${response.status} ${response.statusText}`,
    );
  }
}

class UpstashRedisClient implements RedisClient {
  constructor(private readonly config: RedisConfig) {}

  async get(key: string): Promise<string | null> {
    const response = await fetch(
      `${this.config.url}/get/${encodeURIComponent(key)}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(
        `Redis GET failed: ${response.status} ${response.statusText}`,
      );
    }

    const payload = await response.json();
    return payload.result ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await runPipeline(this.config, [['set', key, value]]);
  }

  async del(keys: string[]): Promise<void> {
    if (!keys.length) {
      return;
    }

    const commands = keys.map((key) => ['del', key]);
    await runPipeline(this.config, commands);
  }
}

export function getRedisClient(): RedisClient | null {
  const config = getRedisConfig();
  if (!config) {
    return null;
  }

  return new UpstashRedisClient(config);
}

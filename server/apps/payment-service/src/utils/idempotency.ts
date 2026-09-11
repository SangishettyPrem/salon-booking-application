import redis from "@/config/redis.js";

const IDEMPOTENCY_PREFIX = "payment:idempotency:";
const IDEMPOTENCY_TTL = 60 * 60 * 24; // 24 hours

export interface IdempotencyRecord {
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  bookingId: string;
  data?: unknown;
  createdAt: string;
}

const getKey = (idempotencyKey: string) => {
  return `${IDEMPOTENCY_PREFIX}${idempotencyKey}`;
};

/**
 * Get an existing idempotency record.
 */
export const getIdempotencyRecord = async (
  idempotencyKey: string,
): Promise<IdempotencyRecord | null> => {
  const key = getKey(idempotencyKey);

  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as IdempotencyRecord;
};

/**
 * Atomically claim an idempotency key.
 *
 * Returns true only if this request successfully
 * created the PROCESSING record.
 */
export const claimIdempotencyKey = async ({
  idempotencyKey,
  bookingId,
}: {
  idempotencyKey: string;
  bookingId: string;
}): Promise<boolean> => {
  const key = getKey(idempotencyKey);

  const record: IdempotencyRecord = {
    status: "PROCESSING",
    bookingId,
    createdAt: new Date().toISOString(),
  };

  const result = await redis.set(
    key,
    JSON.stringify(record),
    "EX",
    IDEMPOTENCY_TTL,
    "NX",
  );

  return result === "OK";
};

/**
 * Mark payment operation as completed.
 */
export const completeIdempotencyKey = async ({
  idempotencyKey,
  bookingId,
  data,
}: {
  idempotencyKey: string;
  bookingId: string;
  data: unknown;
}) => {
  const key = getKey(idempotencyKey);

  const record: IdempotencyRecord = {
    status: "COMPLETED",
    bookingId,
    data,
    createdAt: new Date().toISOString(),
  };

  await redis.set(key, JSON.stringify(record), "EX", IDEMPOTENCY_TTL);
};

/**
 * Mark payment operation as failed.
 */
export const failIdempotencyKey = async ({
  idempotencyKey,
  bookingId,
  data,
}: {
  idempotencyKey: string;
  bookingId: string;
  data?: unknown;
}) => {
  const key = getKey(idempotencyKey);

  const record: IdempotencyRecord = {
    status: "FAILED",
    bookingId,
    data,
    createdAt: new Date().toISOString(),
  };

  await redis.set(key, JSON.stringify(record), "EX", IDEMPOTENCY_TTL);
};

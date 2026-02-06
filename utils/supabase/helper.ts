export class ServiceError extends Error {
    public original?: any;
    constructor(message: string, original?: any) {
        super(message);
        this.name = "ServiceError";
        this.original = original;
    }
}

export function wrapError(context: string, error: unknown) {
    console.error(`${context}:`, error);
    return new ServiceError(context, error);
}

export async function selectMaybeSingle<T = any>(query: any): Promise<T | null> {
    const { data, error } = await query.maybeSingle();

        if (error) throw wrapError("Database select error", error);

    return data ?? null;
}

export async function select<T = any>(query: any): Promise<T[]> {
    const { data, error } = await query;

    if (error) throw wrapError("Database select error", error);

    return data ?? [];
}

export async function insertSingle<T = any>(
  table: any,
  values: any[]
): Promise<T> {
  const { data, error } = await table.insert(values).select().maybeSingle();

  if (error) throw wrapError("Database insert error", error);
  if (!data) throw new ServiceError("Insert returned no data");

  return data as T;
}

export async function upsertSingle<T>(
  query: { upsert: (payload: Partial<T>, options?: { onConflict?: string }) => any },
  payload: Partial<T>,
  options: { onConflict?: string } = {}
): Promise<T> {
  const { data, error } = await query
    .upsert(payload, options)
    .select()
    .maybeSingle();

  if (error) throw wrapError("upsertSingle failed", error);
  if (!data) throw new Error("upsertSingle returned no data");

  return data as T;
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
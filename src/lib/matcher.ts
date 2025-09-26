import { redis } from "@/lib/redis";

export type Similarity = {
  score: number;   // Jaccard similarity (0..1)
  overlap: number; // |A ∩ B|
  union: number;   // |A ∪ B|
  shared: string[];
};

/**
 * Fetch seeker + candidate sets in ONE pipelined request and compute similarity in Node.
 */
export async function pickBestByInterest(
  seekerId: string,
  candidates: string[],
  opts?: { minShared?: number; minJaccard?: number; sample?: number }
): Promise<{ otherId: string; sim: Similarity } | null> {
  const {
    minShared = Number(process.env.MATCH_MIN_SHARED ?? 2),
    minJaccard = Number(process.env.MATCH_MIN_JACCARD ?? 0.2),
    sample = Number(process.env.MATCH_SAMPLE ?? 30),
  } = opts || {};

  const pool = candidates.slice(0, sample).filter((id) => id !== seekerId);
  if (pool.length === 0) return null;

  const seekerKey = `user:interests:${seekerId}`;
  const pipe = redis.pipeline();
  pipe.smembers(seekerKey);
  for (const id of pool) pipe.smembers(`user:interests:${id}`);
  const results = await pipe.exec();

  const seeker = new Set<string>((results[0]?.[1] as string[]) || []);
  if (seeker.size === 0) return null;

  let best: { otherId: string; sim: Similarity } | null = null;
  for (let i = 0; i < pool.length; i++) {
    const otherId = pool[i];
    const tags = new Set<string>((results[i + 1]?.[1] as string[]) || []);
    if (tags.size === 0) continue;

    let overlap = 0;
    const shared: string[] = [];
    for (const t of seeker) if (tags.has(t)) { overlap++; shared.push(t); }
    const union = seeker.size + tags.size - overlap;
    const score = union === 0 ? 0 : overlap / union;

    const sim = { score, overlap, union, shared };
    if (!best || sim.score > best.sim.score) best = { otherId, sim };
  }

  if (!best) return null;
  const ok = best.sim.overlap >= minShared || best.sim.score >= minJaccard;
  return ok ? best : null;
}

export type ToyName = "pendulum" | "bookshelf" | "server-rack";

export interface ToyData {
  toy?: ToyName | "none";
  tags: string[];
}

/** Which toy a post gets: its own choice, else by tag, else the pendulum. */
export function resolveToy(data: ToyData): ToyName | null {
  if (data.toy === "none") return null;
  if (data.toy) return data.toy;
  if (data.tags.includes("book-review")) return "bookshelf";
  if (data.tags.includes("homelab")) return "server-rack";
  return "pendulum";
}

export interface PendulumState {
  angle: number;
  velocity: number;
}

/** One frame of a lightly damped pendulum (angle in radians, 0 = hanging straight down). */
export function stepPendulum({ angle, velocity }: PendulumState, dt = 1): PendulumState {
  const v = (velocity - 0.003 * Math.sin(angle) * dt) * Math.pow(0.996, dt);
  return { angle: angle + v * dt, velocity: v };
}

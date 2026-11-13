import { createHash } from "node:crypto";
/** Stable event keys avoid duplicate sends during retries without embedding recipients. */
export function emailEventKey(kind: string, ...parts: string[]): string {
 const hash=createHash("sha256").update(JSON.stringify(parts)).digest("hex");
 return `${kind}/${hash}`;
}

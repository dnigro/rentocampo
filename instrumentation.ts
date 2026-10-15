export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { enforceUatIsolation } = await import("./lib/uat-isolation");
    enforceUatIsolation(process.env);
  }
}

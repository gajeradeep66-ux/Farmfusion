const healthUrl = 'http://127.0.0.1:7854/api/health';
const timeoutMs = 120_000;
const retryIntervalMs = 1_000;
const startedAt = Date.now();

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(healthUrl);
    if (response.ok) {
      process.exit(0);
    }
  } catch {
    // The API may still be connecting to MongoDB during development startup.
  }

  await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
}

console.error(`FarmFusion API did not become ready within ${timeoutMs / 1_000} seconds: ${healthUrl}`);
process.exit(1);

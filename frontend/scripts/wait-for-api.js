const healthUrl = 'http://127.0.0.1:7854/api/health';
const timeoutMs = 8_000;
const retryIntervalMs = 1_000;
const startedAt = Date.now();

console.log('Checking FarmFusion API at http://127.0.0.1:7854/api/health...');

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(healthUrl);
    if (response.ok) {
      console.log('✓ FarmFusion API is ready.');
      process.exit(0);
    }
  } catch {
    // API is starting up
  }

  await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
}

console.log('ℹ Backend API not ready yet; starting Vite development server anyway.');
process.exit(0);


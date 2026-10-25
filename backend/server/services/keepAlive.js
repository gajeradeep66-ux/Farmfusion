/**
 * FarmFusion 5-Minute Keep-Alive Heartbeat Service
 *
 * Keeps Render free instances awake 24/7 by issuing an inbound public HTTPS
 * request every 5 minutes (well before Render's 15-minute inactivity spin-down).
 * This prevents the "Application loading..." cold-start screen on Render.
 */

let keepAliveTimer = null;
let lastPingTime = null;
let pingCount = 0;
let lastPingStatus = 'initializing';
let pingUrl = '';

export const startKeepAlive = () => {
  // Determine URL to ping:
  // Render injects RENDER_EXTERNAL_URL automatically (e.g. https://farmfusion-api.onrender.com)
  const rawUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_URL ||
    process.env.PUBLIC_URL ||
    'https://farmfusion-api.onrender.com';

  const baseUrl = rawUrl.replace(/\/+$/, '');
  pingUrl = `${baseUrl}/api/health`;

  console.log(`[Keep-Alive] 🚀 Keep-alive heartbeat service active.`);
  console.log(`[Keep-Alive] 🎯 Target healthcheck URL: ${pingUrl}`);
  console.log(`[Keep-Alive] ⏱  Interval: Every 5 minutes (prevents Render 15-min sleep)`);

  const executePing = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'FarmFusion-KeepAlive/2.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      pingCount++;
      lastPingTime = new Date().toISOString();
      lastPingStatus = res.ok ? `OK (${res.status})` : `HTTP ${res.status}`;

      console.log(
        `[Keep-Alive] ✓ 5-Minute Ping #${pingCount} -> Status: ${res.status} at ${lastPingTime} (Service remains 100% LIVE)`
      );
    } catch (err) {
      lastPingTime = new Date().toISOString();
      lastPingStatus = `Error: ${err.message}`;
      console.warn(`[Keep-Alive] ⚠ Ping attempted at ${lastPingTime}: ${err.message}`);
    }
  };

  // Initial ping 25 seconds after boot to verify network
  const initialTimer = setTimeout(executePing, 25000);

  // Recurring ping every 5 minutes (300,000 ms)
  const INTERVAL_MS = 5 * 60 * 1000;
  keepAliveTimer = setInterval(executePing, INTERVAL_MS);

  // Clean shutdown support
  const cleanup = () => {
    clearTimeout(initialTimer);
    if (keepAliveTimer) clearInterval(keepAliveTimer);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
};

export const getKeepAliveStats = () => ({
  enabled: true,
  interval: '5 minutes',
  intervalSeconds: 300,
  pingUrl,
  lastPingTime,
  pingCount,
  lastPingStatus,
  renderSleepPrevention: 'Active (15-min spin-down bypassed)',
});

import fetch from "node-fetch";

const API = process.env.API_URL ?? "http://localhost:4000/api/v1/telemetry";
const DEVICE_TOKEN = process.env.DEVICE_TOKEN ?? "replace-with-device-token";

function random(min, max) {
  return Math.random() * (max - min) + min;
}

async function sendPayload(binId) {
  const payload = {
    binId,
    fillLevel: Number(random(10, 98).toFixed(1)),
    temperatureC: Number(random(24, 72).toFixed(1)),
    batteryLevel: Number(random(20, 100).toFixed(1)),
    timestamp: new Date().toISOString(),
    location: {
      lat: -1.286389,
      lng: 36.817223
    }
  };

  const response = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-token": DEVICE_TOKEN
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log(binId, response.status, text);
}

setInterval(() => {
  sendPayload("BIN-001").catch(console.error);
  sendPayload("BIN-002").catch(console.error);
  sendPayload("BIN-003").catch(console.error);
}, 15000);

console.log("IoT simulator running...");

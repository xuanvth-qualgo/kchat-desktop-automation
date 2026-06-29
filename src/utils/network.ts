import { execSync } from 'child_process';

const WIFI_DEVICE = 'en0';
const WIFI_SERVICE = 'Wi-Fi';

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

function isWifiEnabled(): boolean {
  const output = execSync(
    `networksetup -getairportpower ${WIFI_DEVICE}`,
    { encoding: 'utf8' },
  );

  return output.includes('On');
}

export async function setToggleWifi(
  isOn: boolean,
  timeout = 5000,
): Promise<void> {
  if (isWifiEnabled() === isOn) {
    return;
  }

  execSync(
    `networksetup -setairportpower "${WIFI_SERVICE}" ${isOn ? 'on' : 'off'}`,
    { stdio: 'ignore' },
  );

  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (isWifiEnabled() === isOn) {
      return;
    }

    await sleep(200);
  }

  throw new Error(
    `Failed to turn Wi-Fi ${isOn ? 'ON' : 'OFF'} within ${timeout} ms.`,
  );
}

export async function unstableWifi(
  duration = 30000,
  interval = 1000,
): Promise<void> {
  const end = Date.now() + duration;

  let state = true;

  while (Date.now() < end) {
    state = !state;

    await setToggleWifi(state);

    await sleep(interval);
  }

  await setToggleWifi(true);
}
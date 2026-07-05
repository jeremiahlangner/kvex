import type { ProviderType, ConnectivityState } from "../providers/types";
import { getProviderInfo } from "../providers/registry";

const POLL_INTERVAL = 10_000;

export class ConnectivityMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onStatusChange: (status: ConnectivityState) => void;

  constructor(onStatusChange: (status: ConnectivityState) => void) {
    this.onStatusChange = onStatusChange;
  }

  start(type: ProviderType): void {
    this.stop();
    const info = getProviderInfo(type);
    if (!info || info.isLocal) {
      this.onStatusChange("local");
      return;
    }
    const ping = info.pingEndpoint;
    if (!ping) {
      this.onStatusChange("offline");
      return;
    }
    this.ping(ping);
    this.intervalId = setInterval(() => this.ping(ping), POLL_INTERVAL);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async ping(url: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch(url, { method: "HEAD", signal: controller.signal });
      clearTimeout(timeout);
      this.onStatusChange("online");
    } catch {
      this.onStatusChange("offline");
    }
  }
}

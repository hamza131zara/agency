import type { LeasedJob } from "./repository.js";

export type FakeTransportMode = "success" | "transient_failure" | "permanent_failure" | "timeout";

export class TransportFailure extends Error {
  constructor(
    public readonly code: string,
    public readonly retryable: boolean,
  ) {
    super(code);
    this.name = "TransportFailure";
  }
}

export interface NotificationTransport {
  send(job: LeasedJob): Promise<void>;
}

/**
 * Deterministic sandbox adapter. It intentionally performs no network or mail I/O.
 * A real transport must be separately designed, reviewed and approved after P6.4.
 */
export class FakeNotificationTransport implements NotificationTransport {
  constructor(private readonly mode: FakeTransportMode = "success") {}

  async send(_job: LeasedJob): Promise<void> {
    switch (this.mode) {
      case "success":
        return;
      case "transient_failure":
        throw new TransportFailure("fake_temporary_failure", true);
      case "timeout":
        throw new TransportFailure("fake_timeout", true);
      case "permanent_failure":
        throw new TransportFailure("fake_permanent_failure", false);
    }
  }
}

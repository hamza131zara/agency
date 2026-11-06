export function assertSandboxOnlyRuntime(environment: NodeJS.ProcessEnv = process.env): void {
  if (environment.NODE_ENV === "production") {
    throw new Error(
      "The lead-intake runtime is sandbox-only. Production startup is blocked until P6.6 provider, privacy, operations and release gates are explicitly approved.",
    );
  }
}

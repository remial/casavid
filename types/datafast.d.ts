// TypeScript declarations for DataFast
declare global {
  interface Window {
    datafast: {
      q?: Array<[string, Record<string, string>?]>;
      (goalName: string, params?: Record<string, string>): void;
    };
  }
}

export {};


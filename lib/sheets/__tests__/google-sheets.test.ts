import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  appendExpenseToSheet,
  syncAllExpensesToSheet,
  getSheetsClient,
} from "../google-sheets";

describe("Google Sheets Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL =
      "mock-account@test.iam.gserviceaccount.com";
    process.env.GOOGLE_PRIVATE_KEY =
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6\n-----END PRIVATE KEY-----";
  });

  it("melempar error jika kredensial belum ada", () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    expect(() => getSheetsClient()).toThrow(
      "Google Service Account credentials",
    );
  });

  it("menyiapkan client sheets jika kredensial tersedia", () => {
    const client = getSheetsClient();
    expect(client).toBeDefined();
    expect(client.spreadsheets).toBeDefined();
  });

  it("mengekspor fungsi appendExpenseToSheet dan syncAllExpensesToSheet", () => {
    expect(typeof appendExpenseToSheet).toBe("function");
    expect(typeof syncAllExpensesToSheet).toBe("function");
  });
});
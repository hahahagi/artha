import { describe, it, expect } from "vitest";
import { parseSubscriptionText } from "../subscription-parser";

describe("Subscription Parser Engine", () => {
  it("mem-parse format standar satuan k (Netflix 54k tgl 15)", () => {
    const res = parseSubscriptionText("Netflix 54k tgl 15");
    expect(res).toEqual({
      serviceName: "Netflix",
      amount: 54000,
      currency: "IDR",
      billingDay: 15,
    });
  });

  it("mem-parse format kata 'tanggal' dan titik ribuan (Spotify 55.000 tanggal 25)", () => {
    const res = parseSubscriptionText("Spotify 55.000 tanggal 25");
    expect(res).toEqual({
      serviceName: "Spotify",
      amount: 55000,
      currency: "IDR",
      billingDay: 25,
    });
  });

  it("mem-parse format multi-currency (ChatGPT 20 usd tgl 1)", () => {
    const res = parseSubscriptionText("ChatGPT 20 usd tgl 1");
    expect(res).toEqual({
      serviceName: "ChatGPT",
      amount: 20,
      currency: "USD",
      billingDay: 1,
    });
  });

  it("mem-parse nama layanan lebih dari satu kata (Internet Indihome 350rb tgl 20)", () => {
    const res = parseSubscriptionText("Internet Indihome 350rb tgl 20");
    expect(res).toEqual({
      serviceName: "Internet Indihome",
      amount: 350000,
      currency: "IDR",
      billingDay: 20,
    });
  });

  it("mengembalikan null jika tanggal di luar rentang 1-31 (Gym 200k tgl 35)", () => {
    expect(parseSubscriptionText("Gym 200k tgl 35")).toBeNull();
    expect(parseSubscriptionText("Gym 200k tgl 0")).toBeNull();
  });

  it("mengembalikan null jika tidak ada penanda tanggal (Netflix 54k)", () => {
    expect(parseSubscriptionText("Netflix 54k")).toBeNull();
  });

  it("mengembalikan null jika string kosong", () => {
    expect(parseSubscriptionText("")).toBeNull();
    expect(parseSubscriptionText("   ")).toBeNull();
  });
});
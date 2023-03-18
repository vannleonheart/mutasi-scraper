const ScraperBank = require("../lib/module.scraper.class.js");

describe("ScraperBank", () => {
  let scraper = null;

  beforeEach(() => {
    scraper = new ScraperBank("username", "password", { headless: false });
  });

  afterEach(() => {
    scraper = null;
  });

  it("should throw an error if invalid login credentials are provided", async () => {
    expect.assertions(1);

    try {
      await scraper.getBCA("11", "3", "16", "3");
    } catch (error) {
      expect(error.message).toMatch(/Invalid User ID/);
    }
  });

  it("should return an array of objects containing transaction details for a valid date range", async () => {
    const result = await scraper.getBCA("1", "8", "5", "8");

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toHaveProperty("tanggal");
    expect(result[0]).toHaveProperty("keterangan");
    expect(result[0]).toHaveProperty("cab");
    expect(result[0]).toHaveProperty("nominal");
    expect(result[0]).toHaveProperty("mutasi");
    expect(result[0]).toHaveProperty("saldoakhir");
  });
});

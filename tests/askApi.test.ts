/**
 * Tests for askApi — the client-side fetch wrapper.
 * Mocks global.fetch; no DOM or React required.
 */

import { askApi, AskApiError } from "../src/lib/ask/askApi";

const mockFetch = jest.fn();

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

function respondWith(status: number, body: unknown): void {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    json: async () => body,
  });
}

describe("askApi", () => {
  describe("success", () => {
    it("returns the answer string from the server", async () => {
      respondWith(200, { answer: "GTA V was released in 2013." });

      const result = await askApi("When was GTA V released?");

      expect(result.answer).toBe("GTA V was released in 2013.");
    });

    it("sends POST to /api/ask with question in JSON body", async () => {
      respondWith(200, { answer: "some answer" });

      await askApi("test question");

      expect(mockFetch).toHaveBeenCalledWith("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "test question" }),
      });
    });
  });

  describe("server error responses", () => {
    it("throws AskApiError with the server error message on 400", async () => {
      respondWith(400, { error: "Question must be at most 2000 characters." });

      const err = await askApi("test").catch((e) => e);

      expect(err).toBeInstanceOf(AskApiError);
      expect(err.message).toBe("Question must be at most 2000 characters.");
    });

    it("throws AskApiError with the server error message on 500", async () => {
      respondWith(500, { error: "Server configuration error" });

      const err = await askApi("test").catch((e) => e);

      expect(err).toBeInstanceOf(AskApiError);
      expect(err.message).toBe("Server configuration error");
    });

    it("throws AskApiError with fallback message when non-ok response has no error field", async () => {
      respondWith(500, {});

      const err = await askApi("test").catch((e) => e);

      expect(err).toBeInstanceOf(AskApiError);
      expect(err.message).toBe("Something went wrong.");
    });
  });

  describe("malformed response", () => {
    it("throws AskApiError when ok response is missing the answer field", async () => {
      respondWith(200, { unexpected: "data" });

      const err = await askApi("test").catch((e) => e);

      expect(err).toBeInstanceOf(AskApiError);
      expect(err.message).toBe("Unexpected response from server.");
    });

    it("throws AskApiError when ok response has a non-string answer", async () => {
      respondWith(200, { answer: 42 });

      const err = await askApi("test").catch((e) => e);

      expect(err).toBeInstanceOf(AskApiError);
      expect(err.message).toBe("Unexpected response from server.");
    });
  });

  describe("network failure", () => {
    it("throws AskApiError with a user-friendly message when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      const err = await askApi("test").catch((e) => e);

      expect(err).toBeInstanceOf(AskApiError);
      expect(err.message).toBe("Network error. Please try again.");
    });
  });
});

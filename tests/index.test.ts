import nock from 'nock';
import { expand } from '../src/index';

beforeAll(() => {
    nock.cleanAll();
});

test("should return unshortened URL", async () => {
    const url = "https://example.com/shortened-url";
    const unshortenedUrl = "https://example.com/original-url";

    nock("https://example.com")
        .get("/shortened-url")
        .reply(301, "Moved", { location: unshortenedUrl });
    nock('https://example.com').get('/original-url').times(1).reply(200, 'OK')

    expect(await expand(url)).toBe(unshortenedUrl);
});

test("should handle multiple redirects", async () => {
    const url = "https://example.com/shortened-url";
    const intermediateUrl = "https://example.com/intermediate-url";
    const finalUrl = "https://example.com/original-url";

    nock("https://example.com")
        .get("/shortened-url")
        .reply(301, "Moved", { location: intermediateUrl });
    nock("https://example.com")
        .get("/intermediate-url")
        .reply(301, "Moved", { location: finalUrl });
    nock("https://example.com").get("/original-url").times(1).reply(200, 'OK');

    expect(await expand(url)).toBe(finalUrl);
});

test("should handle no redirects", async () => {
    const url = "https://example.com/original-url";

    nock("https://example.com").get("/original-url").times(1).reply(200, 'OK');

    expect(await expand(url)).toBe(url);
});

test("should handle 404 error", async () => {
    const url = "https://example.com/nonexistent-url";

    nock("https://example.com").get("/nonexistent-url").times(1).reply(404, 'Not Found');

    await expect(expand(url)).rejects.toThrow("Request failed with status code 404");
});

test("should handle if the timeout is less than 5 seconds", async () => {
    const url = "https://example.com/slow-url";

    nock("https://example.com").get("/slow-url").times(1).delay(3000).reply(200, 'OK');

    expect(await expand(url)).toBe(url);
});

test("should timeout if the timeout exceeds more than default 5 seconds", async () => {
    const url = "https://example.com/slow-url";

    nock("https://example.com").get("/slow-url").times(1).delay(6000).reply(200, 'OK');
    await expect(expand(url)).rejects.toThrow();
});

test("should succeed if timeout specified in the options is greater than the time request is taking", async () => {
    const url = "https://example.com/slow-url";

    nock("https://example.com").get("/slow-url").times(1).delay(6000).reply(200, 'OK');

    expect(await expand(url, { timeout: 9000 })).toBe(url);
});

test("should handle max redirects", async () => {
    const url = "https://example.com/shortened-url";
    const intermediateUrl = "https://example.com/intermediate-url";
    const finalUrl = "https://example.com/original-url";

    nock("https://example.com")
        .get("/shortened-url")
        .reply(301, "Moved", { location: intermediateUrl });
    nock("https://example.com")
        .get("/intermediate-url")
        .reply(301, "Moved", { location: finalUrl });
    nock("https://example.com").get("/original-url").times(1).reply(200, 'OK');

    expect(await expand(url, { maxRedirects: 2 })).toBe(finalUrl);
});

test("should throw error if max redirects exceeded", async () => {
    const url = "https://example.com/shortened-url";
    const intermediateUrl = "https://example.com/intermediate-url";

    nock("https://example.com")
        .get("/shortened-url")
        .reply(301, "Moved", { location: intermediateUrl });
    nock("https://example.com")
        .get("/intermediate-url")
        .reply(301, "Moved", { location: intermediateUrl });

    await expect(expand(url, { maxRedirects: 1 })).rejects.toThrow("Max redirects exceeded");
}
);
import handler from 'src/pages/api/v1/upload';
import { endConnection } from 'src/lib/database';
import { createMocks } from 'node-mocks-http';

describe('/upload API Endpoint', () => {
    const api_key = process.env.NODE_PUBLIC_API_KEY || 'default';

    function mockReqRes (method) {
        /* Creating mock-objects of valid types for Next API handlers */
        /* The passed object should correspond to the correct request-format for the endpoint, you can
         * modify or delete any property within a test-case to test for request-format-deviations */
        return createMocks({
            method,
            /*headers: {
                'Content-Type': 'application/json
            },*/
            query: {
                api_key
            },
            body: []
        });
    }

    it("should return with status code 400 and an error message if the request body is not an array", async () => {
        const { req, res } = mockReqRes('POST');
        req.body = {}
        await handler(req, res);
        expect(res._getStatusCode()).toEqual(400);
        expect(res._getJSONData()).toHaveProperty('error');
    });

    it("should return with status code 400 and an error message if the no request body is provided", async () => {
        const { req, res } = mockReqRes('POST');
        delete req.body;
        await handler(req, res);
        expect(res._getStatusCode()).toEqual(400);
        expect(res._getJSONData()).toHaveProperty('error');
    });

    it("should return with status code 403 and an error message if no api_key is provided", async () => {
        const { req, res } = mockReqRes('POST');
        delete req.query.api_key;
        await handler(req, res);
        expect(res._getStatusCode()).toEqual(403);
        expect(res._getJSONData()).toEqual({ error: "No API key provided." });
    });

    it("should return with status code 403 and an error message if a bad api_key is provided", async () => {
        const { req, res } = mockReqRes('POST');
        req.query.api_key = 'something';
        await handler(req, res);
        expect(res._getStatusCode()).toEqual(403);
        expect(res._getJSONData()).toEqual({ error: "The provided API key could not be verified." });
    });

    it("should return with status 405 and an error message if method is GET", async () => {
        const { req, res } = mockReqRes('GET');             // generate new mock-objects
        await handler(req, res)                                     // query the endpoint using the mocks
        expect(res._getStatusCode()).toEqual(405);         // case-2-case assertions
        expect(res._getJSONData()).toHaveProperty('error');
    });

    afterAll(async () => {
        /* close the database connection after running all the tests */
        await endConnection();
    });
});
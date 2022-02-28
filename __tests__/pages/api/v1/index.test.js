import {createMocks} from 'node-mocks-http';
import handler from 'src/pages/api/v1';

describe('/api/v1/', () => {
    it('returns an array with status code 200', async () => {
        const {req, res} = createMocks({
            method: 'GET',
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toBeInstanceOf(Array);
    });
});
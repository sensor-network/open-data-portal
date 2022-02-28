import {createMocks} from 'node-mocks-http';
import { endConnection } from 'src/lib/database';
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

    afterAll(async () => {
        /* close the database connection after running all the tests */
        await endConnection();
    });
});
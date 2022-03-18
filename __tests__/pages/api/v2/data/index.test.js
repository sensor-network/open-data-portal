import handler from 'src/pages/api/v2/data/index'
import { createOne } from 'src/lib/database/data';
import { createMocks } from 'node-mocks-http';

/* Mock the database call. */
jest.mock('src/lib/database/data', () => ({
    __esModule: true,
    /**
     * createOne is an async function that takes in an instance and returns an id.
     * by mocking this, we can test the api alone, and not have the api tests be
     * dependent on the sql database logic.
     **/
    createOne: jest.fn().mockResolvedValue(1)
}));

describe('POST: /data', () => {
    const api_key = process.env.NEXT_PUBLIC_API_KEY || 'default';
    /* wrapper for 'node-mocks-http' createMocks() */
    const mockReqRes = (method = 'POST', body = []) => {
        return createMocks({
            method,
            query: {
                api_key
            },
            body
        });
    };

    it('should call the database using the mock function', async () => {
        /* setup req, res object */
        const { req, res } = mockReqRes('POST', {
            timestamp: '2022-01-01Z',
            latitude: 56,
            longitude: 15,
            sensors: {
                temperature: 5,
                temperature_unit: 'c'
            }
        });
        /* call the api endpoint */
        await handler(req, res);

        /* there should only have been a single call to the database */
        expect(createOne.mock.calls.length).toEqual(1);
        /* mock.calls[0][0] is the argument the mock was called with the first time */
        expect(createOne.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                /* mySQL in Node cannot take the trailing Z when inserting timestamps for some
                *  reason, hence we have cut this of in 'src/lib/conversions/convertTimestamp' */
                timestamp: '2022-01-01T00:00:00.000',
                latitude: 56,
                longitude: 15,
                sensors: {
                    temperature: 278.15
                }
            })
        );
        /* the database should return with the inserted id. in this case we mocked it to be 1 */
        await expect(createOne.mock.results[0].value).resolves.toEqual(1);
        /* if the database called returned with 1, the id of the returned object should also be 1 */
        expect(res._getJSONData()).toEqual(
            expect.objectContaining({
                id: 1,
                timestamp: '2022-01-01T00:00:00.000',
                latitude: 56,
                longitude: 15,
                sensors: {
                    temperature: 278.15
                }
            })
        );
    });
});
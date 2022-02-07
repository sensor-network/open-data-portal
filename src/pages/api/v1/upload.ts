import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST-requests for this endpoint.
    if (req.method !== "POST") {
        console.log(`Error: Method ${req.method} not allowed.`)
        res.status(405)        // 405: method not allowed
            .json({ error:
                `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
        });
        return;
    }

    try {
        const result = {        // sample object, replace with db-response
            id: 1,
            timestamp: new Date(),
            temperature: 20,
            temperature_unit: "C"
        }
        res.status(201)     // 201: created
            .json({ result });
    } catch (e) {
        console.error(e);
        res.status(500)     // 500: internal server error
            .json({ error: "Error uploading data" });
    }
}
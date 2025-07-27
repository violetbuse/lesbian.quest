import { initContract } from "@ts-rest/core";
import z from "zod";

const c = initContract();

export const contract = c.router({
    getHello: {
        method: "GET",
        path: "/hello",
        responses: {
            200: z.object({
                message: z.string()
            })
        },
        summary: "Get a hello message",
    }
}, {
    strictStatusCodes: true,
    pathPrefix: "/api/v1",
})

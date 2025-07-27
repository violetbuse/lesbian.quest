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
        }
    }
}, {
    strictStatusCodes: true,
    pathPrefix: "/api/v1/",
})

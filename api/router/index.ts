import { contract } from "../../shared/contract";
import { tsr } from "@ts-rest/serverless/fetch";

export const router = tsr.platformContext<Env>().router(contract, {
    getHello: async () => {
        return { status: 200, body: { message: "Hello from server!" } }
    }
})
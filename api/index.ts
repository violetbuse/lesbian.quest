import { fetchRequestHandler } from "@ts-rest/serverless/fetch";
import { contract } from "../shared/contract";
import { router } from "./router";

export default {
    fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
        return fetchRequestHandler({
            request,
            contract,
            router,
            platformContext: env,
            options: {
                jsonQuery: true,
                responseValidation: true,
            }
        })
    }
}

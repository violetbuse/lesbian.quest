
export default {
    fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
        return new Response('Hello World')
    }
}

import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { contract } from "../../shared/contract";

const baseUrl = new URL(window.location.origin).origin

export const tsr = initTsrReactQuery(contract, {
    baseUrl,
    credentials: "include",
    validateResponse: true,
    throwOnUnknownStatus: true,
});
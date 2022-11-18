import { getValueFromCookies } from "@util/webstorage";
import router from "next/router";

export function navigateTo(path: any, baseRouteUrl = "",) {
    baseRouteUrl = baseRouteUrl || getValueFromCookies('baseRouteUrl');
    router.push({ pathname: baseRouteUrl + path }, undefined, { scroll: false, shallow: true })
}
import {Teams} from "./constants";

export function getChildrenHeight(el) {
    const children = Array.from(el.children);
    let res = 0;
    if (!children)
        return res;
    children.forEach((child) => {
        res += child.scrollHeight;
    })
    return res;
}

export function padStart(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

export function deepClone(obj = {}) {
    return JSON.parse(JSON.stringify(obj));
}

export function getTeamById(teamId, source = Teams) {
    const team = source.find((team) => team.id == teamId);
    if (team === undefined)
        return undefined;
    return Object.assign(team);
}

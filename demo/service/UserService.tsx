import getConfig from 'next/config';

export class UserService {
    private contextPath: string;
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    public getUsers = (): Promise<Array<any>> => {
        return fetch(`${this.contextPath}/demo/data/user.json`, { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }
}
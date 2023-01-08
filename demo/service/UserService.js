import getConfig from 'next/config';

export class UserService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }



    getUsers() {
        return fetch(this.contextPath + '/demo/data/user.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }


}

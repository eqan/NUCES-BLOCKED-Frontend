import getConfig from 'next/config';

export class ResultService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }



    getResults() {
        return fetch(this.contextPath + '/demo/data/result.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }


}

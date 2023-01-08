import getConfig from 'next/config';

export class DegreeService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }



    getDegrees() {
        return fetch(this.contextPath + '/demo/data/degree.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }


}

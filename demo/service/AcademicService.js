import getConfig from 'next/config';

export class AcademicService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }



    getAcademics() {
        return fetch(this.contextPath + '/demo/data/academic.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }


}

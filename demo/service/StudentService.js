import getConfig from 'next/config';

export class StudentService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }



    getStudents() {
        return fetch(this.contextPath + '/demo/data/student.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data);
    }

   
}

import getConfig from 'next/config';

export class ResultService {
    private contextPath: string;

    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    public async getResults(): Promise<Array<any>> {
        const res = await fetch(`${this.contextPath}/demo/data/result.json`, { headers: { 'Cache-Control': 'no-cache' } });
        const data = await res.json();
        return data.data;
    }
}

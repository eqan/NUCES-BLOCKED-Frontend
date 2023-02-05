import getConfig from 'next/config';


export class AcademicService  {
  private contextPath: string;
  constructor() {
      this.contextPath = getConfig().publicRuntimeConfig.contextPath;
  }
  public getAcademics = (): Promise<Array<any>> => {
    return fetch(`${this.contextPath}/demo/data/academic.json`, { headers: { 'Cache-Control': 'no-cache' } })
        .then((res) => res.json())
        .then((d) => d.data);
  }
}

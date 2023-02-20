import getConfig from 'next/config';

interface Degree {
  id: string;
  name: string;
  rollno: string;
  hash:string;
}

interface DegreeData {
  data: Degree[];
}

export class DegreeService {
  private contextPath: string;

  constructor() {
    this.contextPath = getConfig().publicRuntimeConfig.contextPath;
  }

  getDegrees = (): Promise<Degree[]> => {
    return fetch(`${this.contextPath}/demo/data/degree.json`, { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => res.json())
      .then((d: DegreeData) => d.data);
  }
}

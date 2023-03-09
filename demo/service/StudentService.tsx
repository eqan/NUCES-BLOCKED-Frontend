import getConfig from 'next/config'

interface StudentData {
    data: Array<any>
}

export class StudentService {
    contextPath = getConfig().publicRuntimeConfig.contextPath

    async getStudents(): Promise<Array<any>> {
        const res = await fetch(this.contextPath + '/demo/data/student.json', {
            headers: { 'Cache-Control': 'no-cache' },
        })
        const jsonData = (await res.json()) as StudentData
        return jsonData.data
    }
}

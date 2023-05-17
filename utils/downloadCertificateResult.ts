import axios from 'axios'
import FileSaver from 'file-saver'

export const downloadCertificateResult = async (certificate) => {
    try {
        if (certificate != null) {
            const response = await axios.get(certificate.url, {
                responseType: 'blob',
            })
            const blob = new Blob([response.data], { type: 'application/pdf' })
            console.log(response)
            FileSaver.saveAs(blob, `${certificate.id}.pdf`)
        }
    } catch (error) {
        console.error(error)
        throw new Error(error.message)
    }
    return 'Certificate Downloaded!'
}

import { CV } from './resumer-generator/CV/CV'
import { pdf } from '@react-pdf/renderer'
import { Student } from './resumer-generator/interfaces/interfaces'
import fileUploaderToNFTStorage from './fileUploaderToNFTStorage'
import { CertificateForDatabase } from '../interfaces/CVGenerator'

export async function generatePDFBlob(student: Student): Promise<Blob> {
    if (student) {
        // Create a new Document
        const doc = <CV student={student} />

        // Render the document to a blob
        const blob = await pdf(doc).toBlob()
        return blob
    }
}

export async function cvGeneratorAndUploader(contributions: Student[]) {
    const dataForBlockchain = []
    const dataForDatabase: CertificateForDatabase[] = []

    for (const student of contributions) {
        try {
            const pdfBlob = await generatePDFBlob(student)
            const url = await fileUploaderToNFTStorage(
                pdfBlob,
                student?.heading?.id,
                '.pdf',
                'application/pdf',
                `Academic portfolio of ${student.heading.id}`
            )
            dataForBlockchain.push([
                student.metaDataDetails.rollNumber,
                student.heading.studentName,
                student.metaDataDetails.email,
                url,
                student.topPriorityInformation.cgpa,
                student.heading.batch,
                student?.topPriorityInformation?.honors || '',
            ])
            dataForDatabase.push({
                id: student.metaDataDetails.rollNumber,
                url,
            })
        } catch (error) {
            console.error(error)
            throw new Error(error)
        }
    }
    return { dataForBlockchain, dataForDatabase }
}

import { CV } from './resumer-generator/CV/CV'
import { pdf } from '@react-pdf/renderer'
import { Student } from './resumer-generator/interfaces/interfaces'

export async function generatePDFBlob(student: Student): Promise<Blob> {
    // Create a new Document
    const doc = <CV student={student} />

    // Render the document to a blob
    const blob = await pdf(doc).toBlob()
    return blob
}

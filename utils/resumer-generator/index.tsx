import { useRef } from 'react'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { CV } from './CV/CV'
import { registerFonts } from './utils/registerFonts'
import { student } from './utils/studentDummyData'
import fileUploaderToNFTStorage from '../fileUploaderToNFTStorage'
import styled from 'styled-components'

registerFonts()

const StyledPDFViewer = styled(PDFViewer)`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
`

export default function CVGenerator() {
    const actualFileUploadRef = useRef(null)

    const handleUpload = async (id: string) => {
        await fileUploaderToNFTStorage(
            actualFileUploadRef.current,
            id,
            '.pdf',
            'application/pdf',
            `Academic portfolio of ${id}`
        )
    }

    return (
        <>
            <PDFDownloadLink
                document={<CV student={student} />}
                fileName="example.pdf"
            >
                {({ blob, url, loading, error }): any => {
                    if (!loading && blob) {
                        console.log(blob)
                        actualFileUploadRef.current = blob
                    }
                }}
            </PDFDownloadLink>
        </>
    )
}

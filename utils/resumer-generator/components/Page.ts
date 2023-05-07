import { Page as ReactPDFPage } from '@react-pdf/renderer'
import styled from '@react-pdf/styled-components'

export const Page = styled(ReactPDFPage)`
    z-index: 1;
    flex-direction: column;
    font-family: 'Content';
`

import { View } from '@react-pdf/renderer'
import styled from '@react-pdf/styled-components'
import { Colors, Fonts } from '../../utils/theme'
import { H1, H2, H3 } from '../../components/Text'
import { DegreeMetaDataInfo } from './DegreeMetaDataInfo'
import {
    StudentHeading,
    StudentMetaDataDetails,
} from '../../interfaces/interfaces'

type HeaderProps = {
    heading: StudentHeading
    metaDataDetails: StudentMetaDataDetails
}

export const Header = (
    {
        heading: studentHeading,
        metaDataDetails: studentMetaDataDetails,
    }: HeaderProps,
    ...rest: any
) => (
    <Container {...rest}>
        <MainArea>
            <Name>{studentHeading.studentName}</Name>
            <H2>{studentHeading.degreeName}</H2>
            <H3>{studentHeading.degreeProvider}</H3>
        </MainArea>
        <StyledContacts studentMetaDataDetails={studentMetaDataDetails} />
    </Container>
)

const Container = styled(View)`
    background-color: ${Colors.header};
    color: ${Colors.lightText};
    flex-direction: row;
`
const MainArea = styled(View)`
    flex: 1;
    flex-direction: column;
    margin-left: 10px;
    margin-top: 20px;
    margin-bottom: 0px;
`
const Name = styled(H1)`
    line-height: ${Fonts.lineHeight * 0.8};
`

const StyledContacts = styled(DegreeMetaDataInfo).attrs((props: any) => ({
    studentMetaDataDetails: props.studentMetaDataDetails,
}))`
    margin: 10px 20px 8px;
`

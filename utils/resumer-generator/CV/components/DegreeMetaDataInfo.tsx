import { View } from '@react-pdf/renderer'
import styled from '@react-pdf/styled-components'
import { NormalText } from '../../components/Text'
import { Fonts } from '../../utils/theme'
import { selectStyledGlyph } from '../../components/Glyph'
import { StudentMetaDataDetails } from '../../interfaces/interfaces'

type HeaderProps = {
    studentMetaDataDetails: StudentMetaDataDetails
}

export const DegreeMetaDataInfo = (
    { studentMetaDataDetails }: HeaderProps,
    style: any
) => (
    <Container style={style}>
        <ItemText>
            {selectStyledGlyph('certificate')} <LabelText>Degree Id:</LabelText>{' '}
            <ValueText>{studentMetaDataDetails.degreeId}</ValueText>
        </ItemText>
        <ItemText>
            {selectStyledGlyph('user')} <LabelText>Roll Number:</LabelText>{' '}
            <ValueText>{studentMetaDataDetails.rollNumber}</ValueText>
        </ItemText>
        <ItemText>
            {selectStyledGlyph('verified')}{' '}
            <LabelText>University and HEC Verified</LabelText>
        </ItemText>
    </Container>
)

const Container = styled(View)`
    line-height: 1.2;
    margin-top: 28px;
    margin-right: 8px;
`

const ItemText = styled(NormalText)`
    font-size: ${Fonts.normal * 1.1};
    align-items: center;
    flex-direction: row;
`

const LabelText = styled(NormalText)`
    font-weight: bold;
`

const ValueText = styled(NormalText)`
    flex: 1;
    text-align: right;
`

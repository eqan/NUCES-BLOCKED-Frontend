import { View } from '@react-pdf/renderer'
import { selectStyledGlyph } from '../../components/Glyph'
import {
    SectionTitle,
    Item,
    ItemText,
} from '../templates/StudentContributionSectionTemplate'
import { Contribution } from '../../interfaces/interfaces'

type HeaderProps = {
    index: number
    contribution: Contribution
}
export const Contributions = (
    { index, contribution: contributions }: HeaderProps,
    props: any
) => (
    <View {...props}>
        <SectionTitle index={index}>
            {selectStyledGlyph(contributions.contributorType)}{' '}
            {contributions.contributorType} Section
        </SectionTitle>
        {contributions.subContributions.map((subContribution, index) => (
            <Item
                key={index}
                contributionType={subContribution.contributionType}
                title={subContribution.title}
                dates={subContribution.date}
                contributor={subContribution.contributor}
            >
                <ItemText>{subContribution.contribution}</ItemText>
            </Item>
        ))}
    </View>
)

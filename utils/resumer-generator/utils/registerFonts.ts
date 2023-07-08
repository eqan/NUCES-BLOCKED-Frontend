import { Font } from '@react-pdf/renderer'
import WorkSansLight from './fonts/WorkSansLight.ttf'
import WorkSansRegular from './fonts/WorkSans-Regular.ttf'
import WorkSansMedium from './fonts/WorkSans-Medium.ttf'
import WorkSansSemiBold from './fonts/WorkSans-SemiBold.ttf'
import WorkSansBold from './fonts/WorkSans-Bold.ttf'
import RaleWayRegular from './fonts/Raleway-Regular.ttf'
import RaleWayRegularItalic from './fonts/Raleway-RegularItalic.ttf'
import RaleWayBold from './fonts/Raleway-Bold.ttf'
import FontAwesome from './fonts/fa-regular-400.ttf'
import FontAwesomeSolid from './fonts/fa-solid-900.ttf'
import FontAwesomeBrands from './fonts/fa-brands-400.ttf'

export const registerFonts = (): void => {
    Font.register({
        family: 'Title',
        fonts: [
            {
                fontWeight: 'light',
                src: WorkSansLight,
            },
            {
                fontWeight: 'normal',
                src: WorkSansRegular,
            },
            {
                fontWeight: 'medium',
                src: WorkSansMedium,
            },
            {
                fontWeight: 'semibold',
                src: WorkSansSemiBold,
            },
            {
                fontWeight: 'bold',
                src: WorkSansBold,
            },
        ],
    })
    Font.register({
        family: 'Content',
        fonts: [
            {
                fontWeight: 'normal',
                src: RaleWayRegular,
            },
            {
                fontWeight: 'normal',
                fontStyle: 'italic',
                src: RaleWayRegularItalic,
            },
            {
                fontWeight: 'bold',
                src: RaleWayBold,
            },
        ],
    })
    Font.register({
        family: 'FontAwesome',
        src: FontAwesome,
    })
    Font.register({
        family: 'FontAwesome-Solid',
        src: FontAwesomeSolid,
    })
    Font.register({
        family: 'FontAwesome-Brands',
        src: FontAwesomeBrands,
    })
}

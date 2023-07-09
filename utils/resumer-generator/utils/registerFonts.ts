import { Font } from '@react-pdf/renderer'

const fontLinks = {
    Title: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap',
    Content:
        'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
    FontAwesome: 'https://kit.fontawesome.com/your-kit-id.js',
    'FontAwesome-Solid':
        'https://fonts.googleapis.com/css2?family=Font Awesome+Solid:wght@400;500;600;700;900&display=swap',
    'FontAwesome-Brands':
        'https://fonts.googleapis.com/css2?family=Font Awesome+Brands:wght@400;500;600;700&display=swap',
    WorkSansLight:
        'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap',
    WorkSansRegular:
        'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap',
    WorkSansMedium:
        'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap',
    WorkSansSemiBold:
        'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap',
    WorkSansBold:
        'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap',
    RaleWayRegular:
        'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
    RaleWayRegularItalic:
        'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
    RaleWayBold:
        'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
}

export const registerFonts = (): void => {
    Object.entries(fontLinks).forEach(([family, src]) => {
        Font.register({
            family,
            src,
        })
    })
}

export default function generatePassword() {
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz'
    const symbols = '!@#$%^&*()_+-='
    const digits = '0123456789'

    // Generate one character from each category
    const uppercaseChar = getRandomChar(uppercaseLetters)
    const lowercaseChar = getRandomChar(lowercaseLetters)
    const symbolChar = getRandomChar(symbols)
    const digitChar = getRandomChar(digits)

    // Generate the remaining characters randomly
    const remainingChars = getRandomChars(
        uppercaseLetters + lowercaseLetters + symbols + digits,
        6
    )

    // Combine all the characters and shuffle them
    const password = [
        uppercaseChar,
        lowercaseChar,
        symbolChar,
        digitChar,
        ...remainingChars,
    ]
        .sort(() => Math.random() - 0.5)
        .join('')

    return password
}

// Helper function to get a random character from a string
function getRandomChar(characters) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    return characters[randomIndex]
}

// Helper function to get an array of random characters
function getRandomChars(characters, count) {
    const randomChars = []
    for (let i = 0; i < count; i++) {
        const randomChar = getRandomChar(characters)
        randomChars.push(randomChar)
    }
    return randomChars
}

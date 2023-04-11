import { useState, useEffect } from 'react'

type ThemeType = 'light' | 'dark'

const useTheme = (): ThemeType => {
    const [theme, setTheme] = useState<ThemeType>('light')

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as ThemeType | null
        console.log(storedTheme)
        if (
            storedTheme &&
            (storedTheme === 'light' || storedTheme === 'dark')
        ) {
            setTheme(storedTheme)
        }
    }, [])

    return theme
}

export default useTheme

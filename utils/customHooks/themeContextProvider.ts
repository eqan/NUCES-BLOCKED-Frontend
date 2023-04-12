import { createContext } from 'react'

export type ThemeType = 'light' | 'dark'

export const ThemeContext = createContext<{
    theme: ThemeType
    setTheme: (theme: ThemeType) => void
}>({
    theme: 'light',
    setTheme: () => {},
})

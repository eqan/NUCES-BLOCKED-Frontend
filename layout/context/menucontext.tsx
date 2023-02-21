import React, { useState } from 'react'

interface MenuContextValue {
    activeMenu: string
    setActiveMenu: React.Dispatch<React.SetStateAction<string>>
}

export const MenuContext = React.createContext<MenuContextValue | undefined>(
    undefined
)

interface Props {
    children: React.ReactNode
}

export const MenuProvider: React.FC<Props> = (props) => {
    const [activeMenu, setActiveMenu] = useState('')

    const value: MenuContextValue = {
        activeMenu,
        setActiveMenu,
    }

    return (
        <MenuContext.Provider value={value}>
            {props.children}
        </MenuContext.Provider>
    )
}
//export{type MenuContextValue};

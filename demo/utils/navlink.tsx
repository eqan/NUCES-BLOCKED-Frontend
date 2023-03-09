import { useRouter } from 'next/router'
import Link from 'next/link'
import { ReactNode } from 'react'
import PropTypes from 'prop-types'

interface NavLinkProps {
    href: string
    activeclassname?: string
    exact?: boolean
    role?: string
    target?: string
    ariaLabel?: string
    children: ReactNode
    className: string
}

const NavLink: React.FC<NavLinkProps> = ({
    href,
    exact = false,
    children,
    role,
    target,
    ariaLabel,
    ...props
}) => {
    const { pathname } = useRouter()
    const isActive = exact ? pathname === href : pathname.startsWith(href)
    if (isActive) {
        props.className += ' active-route'
    }

    return (
        <Link href={href} role={role} target={target}>
            <a aria-label={ariaLabel} {...props}>
                {children}
            </a>
        </Link>
    )
}

NavLink.propTypes = {
    href: PropTypes.string.isRequired,
    activeclassname: PropTypes.string,
    exact: PropTypes.bool,
    role: PropTypes.string,
}

export default NavLink

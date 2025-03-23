import { JSX, useEffect } from "react"
import { createPortal } from "react-dom"

interface IPortal {
    children: JSX.Element
    containerId?: string
}

const Portal = ({ children, containerId }: IPortal) => {
    useEffect(() => {
        if (containerId && !document.getElementById(containerId)) {
            const container = document.createElement("div")
            container.id = containerId
            document.body.appendChild(container)
        }

        return () => {
            if (containerId) {
                const container = document.getElementById(containerId)
                if (container) {
                    document.body.removeChild(container)
                }
            }
        }
    }, [])

    return createPortal(
        children,
        (containerId ? document.getElementById(containerId) : null) ?? document.body
    )
}

export default Portal
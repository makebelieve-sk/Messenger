import { JSX, useEffect } from "react";
import { createPortal } from "react-dom";

interface IPortal {
    children: JSX.Element
    containerId?: string
};

export default function Portal({ children, containerId }: IPortal) {
    useEffect(() => {
        if (containerId && !document.getElementById(containerId)) {
            const container = document.createElement("div");
            container.id = containerId;
            document.body.appendChild(container);
        }
    }, []);

    return createPortal(
        children,
        (containerId ? document.getElementById(containerId) : null) ?? document.body
    );
}
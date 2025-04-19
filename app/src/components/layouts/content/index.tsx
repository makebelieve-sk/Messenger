import { type ReactNode } from "react";

import BoxComponent from "@components/ui/box";

import "./content.scss";

interface IContentLayout {
    children: ReactNode;
};

// Общий компонент контента
export default function ContentLayoutComponent({ children }: IContentLayout) {
	return <BoxComponent className="content">
		{children}
	</BoxComponent>;
}

import { memo, type ReactElement } from "react";

import MenuComponent from "@components/ui/menu";
import MenuItemComponent from "@components/ui/menu-item";
import TypographyComponent from "@components/ui/typography";

interface IItem {
    onClick: () => void; 
    className?: string; 
    icon?: ReactElement; 
    title: string;
};

interface IPopoverMenu {
    id: string;
    anchorEl: Element | undefined;
    anchorOrigin: { 
        vertical: "top" | "bottom";
        horizontal: "left" | "center" | "right";
    };
    open: boolean;
    onClose: () => void;
    items: IItem[];
};

// Базовый компонент всплывающего меню
export default memo(function PopoverMenu({ id, anchorEl, anchorOrigin, open, onClose, items }: IPopoverMenu) {
	const onClick = (item: IItem) => {
		item.onClick();
		onClose();
	};

	return <MenuComponent
		id={id}
		anchorEl={anchorEl}
		anchorOrigin={anchorOrigin}
		open={open}
		onClose={onClose}
	>
		{items.map((item, index) => {
			return <MenuItemComponent onClick={() => onClick(item)} className="menu-item" key={`${index}-${item.title}`}>
				<TypographyComponent className={item.className}>
					{item.icon ?? null}
					{item.title}
				</TypographyComponent>
			</MenuItemComponent>;
		})}
	</MenuComponent>;
});
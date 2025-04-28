import ButtonComponent, { type IButtonComponent } from "@components/ui/button";

// Компонент средней кнопки
export function MediumButtonComponent(props: Omit<IButtonComponent, "size">) {
	return <ButtonComponent {...props} size="medium" />;
}
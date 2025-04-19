import ButtonComponent, { type IButtonComponent } from "@components/ui/button";

// Компонент большой кнопки
export function LargeButtonComponent(props: Omit<IButtonComponent, "size">) {
	return <ButtonComponent {...props} size="large" />;
}
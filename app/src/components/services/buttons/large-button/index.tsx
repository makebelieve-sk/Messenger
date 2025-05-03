import ButtonComponent, { type IButtonComponent } from "@components/ui/button";

// Компонент большой кнопки
export default function LargeButtonComponent(props: Omit<IButtonComponent, "size">) {
	return <ButtonComponent {...props} size="large" />;
};
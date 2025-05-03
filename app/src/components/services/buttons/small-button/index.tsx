import ButtonComponent, { type IButtonComponent } from "@components/ui/button";

// Компонент маленькой кнопки
export default function SmallButtonComponent(props: Omit<IButtonComponent, "size">) {
	return <ButtonComponent {...props} size="small" />;
};
import ButtonComponent, { IButtonComponent } from "@components/ui/button";

export function MediumButtonComponent(props: Omit<IButtonComponent, "size">) {
	return <ButtonComponent {...props} size="medium" />;
}
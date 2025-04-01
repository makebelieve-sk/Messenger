import ButtonComponent, { IButtonComponent } from "@components/ui/button";

export function LargeButtonComponent(props: Omit<IButtonComponent, "size">) {
    return <ButtonComponent {...props} size="large" />;
}
import ButtonComponent, { IButtonComponent } from "@components/ui/button";

export function SmallButtonComponent(props: Omit<IButtonComponent, "size">) {
    return <ButtonComponent {...props} size="small" />;
}
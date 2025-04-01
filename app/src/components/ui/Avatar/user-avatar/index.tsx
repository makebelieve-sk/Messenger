import { memo } from "react";
import AvatarComponent, { IAvatarComponent } from "@components/ui/avatar";

export default memo(function UserAvatarComponent({ ...props }: Omit<IAvatarComponent, "className" | "children">) {
    return <AvatarComponent {...props} className="user-avatar" />;
})
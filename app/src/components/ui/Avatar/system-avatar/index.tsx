import { memo } from "react";

import AvatarComponent, { IAvatarComponent } from "@components/ui/avatar";

export default memo(function SystemAvatarComponent({ children }: Pick<IAvatarComponent, "children">) {
    return <AvatarComponent children={children} className="system-avatar" />;
})
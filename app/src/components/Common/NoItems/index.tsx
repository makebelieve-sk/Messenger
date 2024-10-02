import React from "react";

import "./no-items.scss";

interface INoItems {
    text: string;
};

export default React.memo(function NoItems({ text }: INoItems) {
    return <div className="opacity-text no-items">
        {text}
    </div>
});
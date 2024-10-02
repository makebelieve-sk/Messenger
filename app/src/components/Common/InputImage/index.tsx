import React from "react";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import "./input-image.scss";

interface IInputImage {
    id: string;
    text: string;
    loading: boolean;
    multiple?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default React.memo(function InputImage({ id, text, loading, multiple = false, onChange }: IInputImage) {
    return <LoadingButton variant="outlined" size="small" className="input-image" loading={loading} disabled={loading}>
        <label htmlFor={id} className="input-image__label">
            <Typography variant="caption" className="input-image__label__text">{text}</Typography>
            <input id={id} type="file" accept="image/*" hidden multiple={multiple} onChange={onChange} />
        </label>
    </LoadingButton>
});
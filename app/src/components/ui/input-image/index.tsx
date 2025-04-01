import { memo } from "react";

import TypographyComponent from "@components/ui/typography";
import ButtonComponent from "@components/ui/button";

import "./input-image.scss";

interface IInputImageComponent {
    id: string;
    text: string;
    loading: boolean;
    multiple?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// Базовый компонент прикрепления изображения
export default memo(function InputImageComponent({ id, text, loading, multiple = false, onChange }: IInputImageComponent) {
    return <ButtonComponent variant="outlined" size="small" className="input-image" loading={loading} disabled={loading}>
        <label htmlFor={id} className="input-image__label">
            <TypographyComponent variant="caption" className="input-image__label__text">
                {text}
            </TypographyComponent>
            <input id={id} type="file" accept="image/*" hidden multiple={multiple} onChange={onChange} />
        </label>
    </ButtonComponent>
});
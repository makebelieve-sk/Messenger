import { type ChangeEvent, memo, useRef } from "react";

import SmallButtonComponent from "@components/services/buttons/small-button";
import TypographyComponent from "@components/ui/typography";

import "./input-image.scss";

interface IInputImageComponent {
    id: string;
    text: string;
    loading: boolean;
    multiple?: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

// Базовый компонент прикрепления изображения
export default memo(function InputImageComponent({ id, text, loading, multiple = false, onChange }: IInputImageComponent) {
	const inputRef = useRef<HTMLInputElement>(null);

	// Обработка клика по скрытому инпуту
	const onLabelClick = () => {
		inputRef.current?.click();
	};

	return <label htmlFor={id} className="input-label" onClick={onLabelClick}>
		<input 
			ref={inputRef}
			id={id} 
			type="file" 
			accept="image/*" 
			hidden 
			multiple={multiple} 
			onChange={onChange} 
		/>

		<SmallButtonComponent
			variant="outlined"
			className="input-label__button"
			loading={loading}
			disabled={loading}
		>
			<TypographyComponent variant="caption" className="input-label__button__text">
				{text}
			</TypographyComponent>
		</SmallButtonComponent>
	</label>;
});
import { render, screen } from "@testing-library/react";

import Portal from "@components/ui/portal";

describe("Portal", () => {

	test("Portal shows correct", () => {
		render(<Portal><div>Test</div></Portal>);
		const portalElement = screen.getByText("Test");
		expect(portalElement).toBeInTheDocument();
		expect(portalElement.parentElement).toBe(document.body);
	});

	test("creates container with specified ID if it doesn't exist", () => {
		const containerId = "test-container";

		// Проверяем, что контейнера изначально нет
		expect(document.getElementById(containerId)).toBeNull();

		render(<Portal containerId={containerId}><div>Test</div></Portal>);

		// Проверяем, что контейнер был создан
		expect(document.getElementById(containerId)).not.toBeNull();

		expect(document.getElementById(containerId)?.parentElement).toBe(document.body);
	});

	test("uses existing container if it already exists", () => {
		const containerId = "test-container";
		const container = document.createElement("div");
		container.id = containerId;
		document.body.appendChild(container);

		render(<Portal containerId={containerId}><div>Test</div></Portal>);

		expect(document.getElementById(containerId)?.parentElement).toBe(document.body);
	});

	test("matches snapshot", () => {
		const { asFragment } = render(<Portal><div>Test</div></Portal>);

		// Снимаем снапшот компонента
		expect(asFragment()).toMatchSnapshot();
	});
});
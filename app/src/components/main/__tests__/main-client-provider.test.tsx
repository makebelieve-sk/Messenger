import { useContext } from "react";
import { render } from "@testing-library/react";

import MainClientProvider, { MainClientContext } from "@components/main/MainClientProvider";
import MainClient from "@core/MainClient";

describe("MainClientProvider", () => {
	it("should render App component inside provider", () => {
		const { container } = render(<MainClientProvider />);
		expect(container.querySelector(".main-content")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should provide MainClient instance via context", () => {
		let contextValue: MainClient | undefined;
		function Consumer() {
			contextValue = useContext(MainClientContext);
			return null;
		}
		const mainClient = new MainClient();
		const { container } = render(
			<MainClientContext.Provider value={mainClient}>
				<Consumer />
			</MainClientContext.Provider>,
		);
		expect(contextValue).toBe(mainClient);
		expect(container).toMatchSnapshot();
	});
});

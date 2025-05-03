const mockUseAppSelector = jest.fn();
const mockUseAppDispatch = jest.fn();

export const useAppSelector = mockUseAppSelector;
export const useAppDispatch = mockUseAppDispatch;

export { mockUseAppSelector, mockUseAppDispatch };

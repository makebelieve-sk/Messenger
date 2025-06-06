import { mockUserService } from "./useProfile";

const useUser = jest.fn().mockReturnValue(mockUserService);

export default useUser; 
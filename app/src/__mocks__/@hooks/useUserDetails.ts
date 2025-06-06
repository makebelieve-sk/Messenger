import { mockUserDetailsService } from "./useProfile";

const useUserDetails = jest.fn().mockReturnValue(mockUserDetailsService);

export default useUserDetails; 
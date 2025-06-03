import UserDetailsService from "@core/services/UserDetailsService";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import { IUserDetails } from "@custom-types/models.types";
import { muchSelected } from "@utils/index";

jest.mock("@service/i18n", () => ({
	__esModule: true,
	default: {
		t: jest.fn((key) => `translated:${key}`),
	},
}));

jest.mock("@service/Logger", () => ({
	__esModule: true,
	default: {
		init: jest.fn(() => ({
			debug: jest.fn(),
		})),
	},
}));

const setUserDetailsMock = jest.fn();
jest.mock("@store/user", () => ({
	__esModule: true,
	default: {
		getState: () => ({
			setUserDetails: setUserDetailsMock,
		}),
	},
}));

jest.mock("@utils/date", () => ({
	getMonthName: jest.fn((idx) => ` Month${idx}`),
}));

jest.mock("@utils/index", () => ({
	muchSelected: jest.fn((count, texts) => `${count}:${texts.join(",")}`),
}));

describe("UserDetailsService", () => {
	const sampleDetails = {
		userId: "u1",
		sex: "male",
		birthday: "1990-05-20",
		city: "CityX",
		work: "WorkY",
		lastSeen: "2025-06-01T12:00:00Z",
	};

	let loggerInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		loggerInstance = (Logger.init as jest.Mock).mock.results[0]?.value;
		if (!loggerInstance) {
			loggerInstance = { debug: jest.fn() };
			(Logger.init as jest.Mock).mockReturnValue(loggerInstance);
		}
	});

	it("accessors return correct values when details present", () => {
		const svc = new UserDetailsService(sampleDetails);

		expect(svc._userId).toBe("u1");
		expect(svc._sex).toBe("male");
		expect(svc._birthday).toBe("20 Month4. 1990");
		expect(svc._city).toBe("CityX");
		expect(svc._work).toBe("WorkY");
		expect(svc._lastSeen).toBe("2025-06-01T12:00:00Z");
		expect(svc._editSex).toBe("male");
		expect(svc._editBirthday).toBe("1990-05-20");
		expect(svc._editCity).toBe("CityX");
		expect(svc._editWork).toBe("WorkY");
	});

	it("accessors return NOT_COMPLETE or empty when fields missing", () => {
		const partialDetails = { userId: "u2" } as IUserDetails;
		const svc = new UserDetailsService(partialDetails);

		expect(svc._sex).toBe("translated:profile-module.not_complete");
		expect(svc._birthday).toBe("translated:profile-module.not_complete");
		expect(svc._city).toBe("translated:profile-module.not_complete");
		expect(svc._work).toBe("translated:profile-module.not_complete");
		expect(svc._lastSeen).toBe("");
		expect(svc._editSex).toBe("");
		expect(svc._editBirthday).toBe("");
		expect(svc._editCity).toBe("");
		expect(svc._editWork).toBe("");
	});

	it("syncUserDetails re-emits current details to store", () => {
		const svc = new UserDetailsService(sampleDetails);
		setUserDetailsMock.mockClear();

		svc.syncUserDetails();

		expect(setUserDetailsMock).toHaveBeenCalled();
	});

	it("getFriendsText and similar methods delegate to muchSelected", () => {
		const svc = new UserDetailsService(sampleDetails);

		(i18next.t as unknown as jest.Mock).mockReturnValueOnce("f0")
			.mockReturnValueOnce("f1")
			.mockReturnValueOnce("f2");
		expect(svc.getFriendsText(5)).toBe("5:f0,f1,f2");

		(i18next.t as unknown as jest.Mock).mockReturnValueOnce("s0")
			.mockReturnValueOnce("s1")
			.mockReturnValueOnce("s2");
		expect(svc.getSubscribersText(3)).toBe("3:s0,s1,s2");

		(i18next.t as unknown as jest.Mock).mockReturnValueOnce("p0")
			.mockReturnValueOnce("p1")
			.mockReturnValueOnce("p2");
		expect(svc.getPhotosText(1)).toBe("1:p0,p1,p2");

		(i18next.t as unknown as jest.Mock).mockReturnValueOnce("a0")
			.mockReturnValueOnce("a1")
			.mockReturnValueOnce("a2");
		expect(svc.getAudiosText(2)).toBe("2:a0,a1,a2");

		(i18next.t as unknown as jest.Mock).mockReturnValueOnce("v0")
			.mockReturnValueOnce("v1")
			.mockReturnValueOnce("v2");
		expect(svc.getVideosText(0)).toBe("0:v0,v1,v2");

		expect(muchSelected).toHaveBeenCalledTimes(5);
	});
});

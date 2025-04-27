export const useTranslation = () => ({
    t: (key: string) => {
        const dictionary: Record<string, string> = {
            "menu.profile": " My profile",
            "menu.messanger": "Messenger",
            "menu.friends": "Friends",
            "menu.to-developers": "To developers",
            "header.settings": "Settings",
            "header.help": "Help",
            "header.logout": "Log Out"
        };
        return dictionary[key];
    },
    i18n: {
        changeLanguage: jest.fn(),
        use: jest.fn().mockReturnThis(), // Мок для вызова use()
        init: jest.fn(), // Мок для вызова init()
    },
})

export const initReactI18next = {
    type: "3rdParty",
    init: jest.fn(),
}
export default () => ({
    on: jest.fn(),
    off: jest.fn(),
    user: {
        avatarUrl: jest.fn(),
        fullName: jest.fn()
    },
})
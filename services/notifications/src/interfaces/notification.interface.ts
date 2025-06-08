export default interface NotificationStrategy {
    send(recipient: string, payload: any): Promise<void>;
}
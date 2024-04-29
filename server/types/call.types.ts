export interface ICallSettings {
    audio: boolean; 
    video: { width: number; height: number; } | boolean;
};
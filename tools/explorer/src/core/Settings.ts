class Settings {
    private static _storageKey = 'settings';
    public customCursor: boolean;

    constructor() {
        const rawSettings = JSON.parse(localStorage.getItem(Settings._storageKey) || '{}');
        this.customCursor = rawSettings.customCursor;
    }

    private _serialize() {
        return JSON.stringify({
            customCursor: this.customCursor
        });
    }

    public save() {
        const raw = this._serialize();
        localStorage.setItem(Settings._storageKey, raw);
    }
}

export const settings = new Settings();

export class TextureNotFoundError extends Error {
    public readonly name = 'TextureNotFoundError';
    constructor(id: number) {
        super(`Could not find texture with id ${id}`);
    }
}
export class TileNotFoundError extends Error {
    public readonly name = 'TileNotFoundError';
    constructor(id: number) {
        super(`Could not find tile with id ${id}`);
    }
}
export class ConversionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConversionError';
    }
}
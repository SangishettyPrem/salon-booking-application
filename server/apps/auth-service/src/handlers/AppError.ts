export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;
    public readonly errorCode?: string;

    constructor(message: string, statusCode: number = 400, code: string = "APP_ERROR") {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        this.errorCode = code;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
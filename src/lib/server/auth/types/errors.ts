export abstract class AuthError extends Error {
	public abstract status: number;
	constructor(public override message: string) {
		super(message);
	}
}

export class UserAlreadyExistsError extends AuthError {
	public override status = 400;
	constructor() {
		super('User already exists');
		this.name = 'USER_ALREADY_EXISTS';
	}
}

export class UserNotFoundError extends AuthError {
	public override status = 404;
	constructor() {
		super('User not found');
		this.name = 'USER_NOT_FOUND';
	}
}

export class InvalidCredentialsError extends AuthError {
	public override status = 401;
	constructor() {
		super('Invalid credentials');
		this.name = 'INVALID_CREDENTIALS';
	}
}

export class InvalidRefreshTokenError extends AuthError {
	public override status = 401;
	constructor() {
		super('Invalid refresh token');
		this.name = 'INVALID_REFRESH_TOKEN';
	}
}

export class IllegalUpdateError extends AuthError {
	public override status = 403;
	constructor() {
		super(
			'The requesting user has insufficient permissions to update some of the requested fields'
		);
		this.name = 'ILLEGAL_UPDATE';
	}
}

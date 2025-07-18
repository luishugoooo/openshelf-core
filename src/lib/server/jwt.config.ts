import { jwt } from '@elysiajs/jwt';
import { JWT_SECRET, JWT_EXPIRY as JWT_EXPIRY_ENV } from '$env/static/private';
export const JWT_EXPIRY = JWT_EXPIRY_ENV
	? JWT_EXPIRY_ENV === '0'
		? Math.floor(Date.now() / 1000) + 999999999999999
		: Math.floor(Date.now() / 1000) + Number(JWT_EXPIRY_ENV)
	: Math.floor(Date.now() / 1000) + 60 * 60;

export const jwtConfig = jwt({
	name: 'jwt_auth', // this name will be used to access jwt within the request object
	secret: JWT_SECRET // Should be in a .env!!
});

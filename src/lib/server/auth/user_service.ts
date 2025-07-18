import Elysia, { status, t } from 'elysia';
import { JWT_EXPIRY, jwtConfig } from '../jwt.config';
import { eq } from 'drizzle-orm';
import { db } from '../db';

import { createUser, loginWithEmail } from './user';
import { AuthError, InvalidRefreshTokenError, UserNotFoundError } from './types/errors';
import { users } from '$lib/server/db/schema';
import { getSettings, setSettings } from '../settings/settings';

export const userAuth = new Elysia({ name: 'user' })
	.model({
		credentials: t.Object({
			access_token: t.String(),
			refresh_token: t.String()
		})
	})
	.use(jwtConfig)
	.resolve({ as: 'scoped' }, async ({ jwt_auth, headers }) => {
		console.log('Checking auth');
		const token = headers['authorization']?.split(' ')[1];
		const decoded = await jwt_auth.verify(token);
		if (!decoded) {
			return { user: null };
		}
		const user = await db.query.users.findFirst({
			where: eq(users.id, Number(decoded.id))
		});
		if (!user) {
			return { user: null };
		}
		return { user };
	})
	.macro({
		isAuthenticated(enabled: boolean) {
			if (!enabled) return;
			return {
				beforeHandle: ({ user }) => {
					if (!user) {
						return status(401);
					}
				}
			};
		},
		isAdmin(enabled: boolean) {
			if (!enabled) return;
			return {
				beforeHandle: ({ user }) => {
					if (user?.role !== 'admin') {
						return status(403);
					}
				}
			};
		}
	});

export const userService = new Elysia({ name: 'user/service', prefix: '/auth' })
	.model({
		signIn: t.Object({
			email: t.String(),
			password: t.String()
		}),
		credentials: t.Object({
			access_token: t.String(),
			refresh_token: t.String()
		})
	})
	.use(userAuth)
	.onError(({ error, status }) => {
		if (error instanceof AuthError) {
			return status(error.status, { code: error.name, message: error.message });
		}
		return status(500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
	})
	.post(
		'/login',
		async ({ body, jwt_auth }) => {
			const { email, password } = body;
			const user = await loginWithEmail({ email, password });
			const accessToken = await jwt_auth.sign({
				id: user.id,
				exp: JWT_EXPIRY
			});
			const refreshToken = await jwt_auth.sign({
				id: user.id,
				exp: JWT_EXPIRY + 2628000 // 30 days
			});
			return { access_token: accessToken, refresh_token: refreshToken };
		},
		{ body: 'signIn' }
	)
	.post(
		'/register',
		async ({ body, jwt_auth }) => {
			const { email, password } = body;
			const newUser = await createUser({ email, password });
			const accessToken = await jwt_auth.sign({
				id: newUser.id,
				exp: JWT_EXPIRY
			});
			const refreshToken = await jwt_auth.sign({
				id: newUser.id,
				exp: JWT_EXPIRY + 2628000 // 30 days
			});
			await setSettings('initialSetupComplete', 'true');
			return { access_token: accessToken, refresh_token: refreshToken };
		},
		{
			body: 'signIn',
			beforeHandle: async ({ user }) => {
				const initialSetupComplete = await getSettings('initialSetupComplete');
				if (user?.role !== 'admin' && initialSetupComplete === 'true') {
					return status(403);
				}
			}
		}
	)
	.post(
		'/refresh',
		async ({ body, jwt_auth }) => {
			const { refreshToken } = body;
			const decoded = await jwt_auth.verify(refreshToken);
			if (!decoded) {
				throw new InvalidRefreshTokenError();
			}
			const user = await db.query.users.findFirst({
				where: eq(users.id, Number(decoded.id))
			});
			if (!user || user.refreshToken !== refreshToken) {
				throw new InvalidRefreshTokenError();
			}

			const accessToken = await jwt_auth.sign({
				id: user.id,
				exp: JWT_EXPIRY
			});
			return { access_token: accessToken };
		},
		{ body: t.Object({ refreshToken: t.String() }) }
	)
	.get(
		'/me',
		async ({ user }) => {
			if (!user) {
				throw new UserNotFoundError();
			}
			return {
				id: user.id,
				email: user.email,
				role: user.role
			};
		},
		{ isAuthenticated: true }
	);

import { eq, or } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { SelectUser } from './types/user';
import { InvalidCredentialsError, UserAlreadyExistsError, UserNotFoundError } from './types/errors';

export async function createUser({
	email,
	username,
	password
}: {
	email: string;
	username?: string;
	password: string;
}): Promise<SelectUser> {
	const existingUser = await db.query.users.findFirst({
		where: or(eq(users.email, email), eq(users.username, email))
	});

	if (existingUser) throw new UserAlreadyExistsError();

	const passwordHash = await Bun.password.hash(password);
	const user = (
		await db
			.insert(users)
			.values({
				email,
				username,
				password: passwordHash
			})
			.returning()
	)[0];

	return user;
}

export async function loginWithEmail({
	email,
	password
}: {
	email: string;
	password: string;
}): Promise<SelectUser> {
	const user = await db.query.users.findFirst({
		where: eq(users.email, email)
	});
	if (!user) throw new UserNotFoundError();
	const isPasswordValid = await Bun.password.verify(password, user.password);
	if (!isPasswordValid) throw new InvalidCredentialsError();

	return user;
}

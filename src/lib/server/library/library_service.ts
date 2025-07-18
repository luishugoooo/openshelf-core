import Elysia, { file, status, t } from 'elysia';
import { userAuth } from '../auth/user_service';
import { db } from '../db/index';
import { books, user_readings } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { clearLibrary, loadFromAnnasArchive, scanBooks } from './books';
import { AuthError, IllegalUpdateError } from '../auth/types/errors';

export const libraryService = new Elysia({ prefix: '/library' })
	.use(userAuth)
	.onError(({ error, code }) => {
		console.log(error);
		if (error instanceof AuthError) {
			return status(error.status, { code: error.name, message: error.message });
		}
		if (code === 'VALIDATION') {
			return status(400, {
				code: 'INVALID_REQUEST',
				message: error.model
			});
		}
		return error;
	})
	.get(
		'/books',
		async () => {
			const books = await db.query.books.findMany();
			return books.map((book) => ({
				...book,
				cover: undefined,
				filePath: undefined
			}));
		},
		{ isAuthenticated: true }
	)
	.get(
		'/cover/:id',
		async ({ params }) => {
			const book = await db.query.books.findFirst({
				where: eq(books.id, Number(params.id))
			});
			if (!book) {
				throw new Error('Book not found');
			}
			return new Response(book.cover, {
				headers: {
					'Content-Type': 'image/jpeg'
				}
			});
		},
		{ isAuthenticated: true }
	)
	.post(
		'/scan',
		async () => {
			return await scanBooks();
		},
		{ isAdmin: true }
	)
	.post(
		'/clear',
		async () => {
			await clearLibrary();
			return { message: 'Library cleared' };
		},
		{ isAdmin: true }
	)
	.post(
		'/load-from-annas-archive',
		async ({ body }) => {
			await loadFromAnnasArchive({ md5: body.md5 });
			return await scanBooks();
		},
		{ isAdmin: true, body: t.Object({ md5: t.String() }) }
	)
	.get(
		'/download/:id',
		async ({ params }) => {
			const book = await db.query.books.findFirst({
				where: eq(books.id, Number(params.id))
			});
			if (!book) {
				throw new Error('Book not found');
			}
			return file(`${Bun.env.LIBRARY_PATH}/${book.filePath}`);
		},
		{ isAuthenticated: true }
	)
	.post(
		'/update-book',
		async ({ body, user }) => {
			const { book_id, progress, title, author, publisher, year } = body;
			if (progress) {
				await db
					.update(user_readings)
					.set({ progress, updatedAt: new Date() })
					.where(
						and(eq(user_readings.book_id, book_id), eq(user_readings.user_id, user?.id ?? -1))
					);
			}
			if (title || author || publisher || year) {
				await db.update(books).set({ title, author, publisher, year }).where(eq(books.id, book_id));
			}
			return status(200, { message: 'Book updated' });
		},
		{
			isAuthenticated: true,
			body: t.Object({
				book_id: t.Number({ format: 'int64', error: 'Invalid book ID (must be an integer)' }),
				progress: t.Optional(t.String()),
				title: t.Optional(t.String()),
				author: t.Optional(t.String()),
				publisher: t.Optional(t.String()),
				year: t.Optional(t.Number())
			}),
			beforeHandle: async ({ body, user }) => {
				if (!(await db.query.books.findFirst({ where: eq(books.id, body.book_id) }))) {
					return status(404, { code: 'BOOK_NOT_FOUND', message: 'Book not found' });
				}
				// Check if any admin-only fields are being updated
				const hasAdminOnlyFields =
					body.title !== undefined ||
					body.author !== undefined ||
					body.publisher !== undefined ||
					body.year !== undefined;

				if (hasAdminOnlyFields && user?.role !== 'admin') {
					throw new IllegalUpdateError();
				}
			}
		}
	);

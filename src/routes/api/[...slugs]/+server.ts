import Elysia from 'elysia';
import { userService } from '$lib/server/auth/user_service';
import { libraryService } from '$lib/server/library/library_service';

const app = new Elysia({
	prefix: '/api'
})

	.use(userService)
	.use(libraryService)
	.get('/ping', () => 'pong');

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

export const GET: RequestHandler = ({ request }) => app.handle(request);
export const POST: RequestHandler = ({ request }) => app.handle(request);

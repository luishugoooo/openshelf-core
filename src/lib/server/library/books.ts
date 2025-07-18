import { pathToFileURL } from 'bun';
import { db } from '../db';
import fs from 'fs';
import { books } from '../db/schema';
import { EPub } from '../util/epub';

/*
  Scan the library for new books and add them to the database. Returns the amount of new books added.
*/
export async function scanBooks() {
	const existingBooks = (
		await db.query.books.findMany({
			columns: { filePath: true }
		})
	).map((book) => book.filePath);

	console.log(existingBooks);
	const fileScan = fs.readdirSync(pathToFileURL(process.env.LIBRARY_PATH!));
	console.log(fileScan);
	const newBooks = fileScan.filter((file) => !existingBooks.includes(file));

	for (const book of newBooks) {
		console.log(`Scanning ${book}`);
		const bookPath = process.env.LIBRARY_PATH! + '/' + book;
		console.log(`Book path: ${bookPath}`);

		const bookData = new EPub(bookPath.toString());

		// Wait for the EPub to finish parsing
		await bookData.init();

		const metadata = bookData.metadata;
		console.log(metadata);
		await db.insert(books).values({
			title: metadata.title ?? '',
			author: metadata.author ?? '',
			year: Number(metadata.date?.split('-')[0] ?? ''),
			filePath: book,
			//TODO: Add other book types
			type: 'epub' as const,
			publisher: metadata.publisher ?? '',
			cover: metadata.cover ? Buffer.from(await metadata.cover.arrayBuffer()) : null
		});
	}
	return newBooks.length;
}

/* DEBUG FUNCTION */
export async function clearLibrary() {
	await db.delete(books);
}

export async function loadFromAnnasArchive({ md5 }: { md5: string }) {
	const secret = Bun.env.ANNAS_ARCHIVE_SECRET;
	if (!secret) {
		throw new Error('ANNAS_ARCHIVE_SECRET is not set');
	}
	console.log(`secret: ${secret}, md5: ${md5}`);
	const res = await fetch(
		`https://annas-archive.org/dyn/api/fast_download.json?` +
			new URLSearchParams({ md5, key: secret }).toString()
	);

	const resJson = await res.json();
	const file = await fetch(resJson.download_url);
	const fileName = res.headers.get('Content-Disposition')?.split('filename=')[1] ?? `${md5}.epub`;
	await Bun.write(`${process.env.LIBRARY_PATH!}/${fileName}`, await file.arrayBuffer());
	return fileName;
}

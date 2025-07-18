/* eslint-disable @typescript-eslint/no-explicit-any */
import JSZip from 'jszip';
import { parseString } from 'xml2js';

export class EPub {
	private path: string;
	private epubZip: JSZip | null = null;
	package: any;
	manifest: any;
	metadata!: EpubMetadata;

	constructor(path: string) {
		this.path = path;
	}

	async init() {
		const file = await Bun.file(this.path).arrayBuffer();
		this.epubZip = await JSZip.loadAsync(file);
		//console.log("epubZip", epubZip);
		const containerXml = await this.epubZip?.file('META-INF/container.xml')?.async('string');
		//console.log("containerXml", containerXml);
		let result: any;
		parseString(containerXml!, (err: any, res: any) => {
			result = res;
		});
		//console.log("result", result);
		const rootFilePath = result.container.rootfiles[0].rootfile[0].$['full-path'];
		//console.log("rootFilePath", rootFilePath);
		const rootFile = this.epubZip?.file(rootFilePath);
		//console.log("rootFile", rootFile);
		if (!rootFile) {
			throw new Error('Could not find root file');
		}
		const rootDir = rootFile.name.split('/').slice(0, -1).join('/');
		this.epubZip = this.epubZip.folder(rootDir);
		const rootFileXml = await rootFile.async('string');
		//console.log("rootFileXml", rootFileXml);
		let rootFileContent: any;
		parseString(rootFileXml, (err: any, res: any) => {
			rootFileContent = res;
		});
		this.package = rootFileContent;
		this.manifest = rootFileContent.package.manifest[0].item;
		//console.dir(this.manifest, { depth: null });
		const cover = await this.getCover();
		this.metadata = {
			title:
				rootFileContent.package.metadata[0]['dc:title']?.[0]['_'] ??
				rootFileContent.package.metadata[0]['dc:title']?.[0],
			author:
				rootFileContent.package.metadata[0]['dc:creator']?.[0]['_'] ??
				rootFileContent.package.metadata[0]['dc:creator']?.[0],
			publisher:
				rootFileContent.package.metadata[0]['dc:publisher']?.[0]['_'] ??
				rootFileContent.package.metadata[0]['dc:publisher']?.[0],
			language:
				rootFileContent.package.metadata[0]['dc:language']?.[0]['_'] ??
				rootFileContent.package.metadata[0]['dc:language']?.[0],
			date:
				rootFileContent.package.metadata[0]['dc:date']?.[0]['_'] ??
				rootFileContent.package.metadata[0]['dc:date']?.[0],
			cover: cover
		};
		return this.package;
	}

	async getCover() {
		const coverRefId = this.package.package.metadata[0]['meta']?.find(
			(item: any) => item.$.name === 'cover'
		)?.$.content;
		if (!coverRefId) {
			return null;
		}
		const coverRef = this.manifest.find((item: any) => item.$.id === coverRefId);

		if (!coverRef) {
			throw new Error('Could not find cover');
		}
		//.log("coverRef", coverRef);
		const coverFile = this.epubZip?.file(coverRef.$.href);
		//console.log("coverFile", coverFile);
		if (!coverFile) {
			throw new Error('Could not find cover file');
		}
		const coverBuffer = await coverFile.async('arraybuffer');
		return new Blob([coverBuffer], { type: 'image/jpeg' });
	}
}

export interface EpubMetadata {
	title: string | null;
	author: string | null;
	publisher: string | null;
	language: string | null;
	date: string | null;
	cover: Blob | null;
}

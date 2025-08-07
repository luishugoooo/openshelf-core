# OpenShelf

> [!WARNING]
> **This project is WIP**
> 
> OpenShelf is currently WIP and not usable beyond testing purposes. Especially Authentication is unfinished and untested.

## About

OpenShelf aspires to be a robust solution to self-host ebook libraries.

This monorepo contains:

- **Backend**: The core openshelf service (WIP)
- **WebUI**: The official web interface (Planned)
- **Cross-Platform App**: The official cross-platform application (WIP)
- Some utility libraries (custom epub parser, ...)


## Goals

- **Sync and offline capabilities:** The official app is being built with offline use in mind and syncs with the server automatically (active WIP)
- **WebUI:** The WebUI is currently being built for administration, with online content streaming as a future possibility
- **Low barrier of entry:** The performance of the core service is constantly tested against a Raspberry PI, so the cost of self-hosting is kept minimal

## Screenshots (Extremely early)

<img width="802" height="527" alt="image" src="https://github.com/user-attachments/assets/d75df2ee-b84f-4683-8e17-342cddc4bd0e" />



## Architecture

This project is organized as a monorepo with the following packages:

- `packages/backend/` - Core Bun.js/Elysia service
- `packages/app/` - Flutter cross-platform app 
- `packages/webui/` - Web interface (planned)
- `packages/epub/` - Typescript EPUB processing utilities
- `packages/shared/` - Shared TypeScript types and utilities

## Contributing

This is currently a personal project with many design choices to be made. Once somewhat stable, PRs are welcome.

## License

The project is licensed under AGPL 3.0

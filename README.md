# OpenShelf

> [!WARNING]
> **This project is WIP**
> 
> OpenShelf is currently WIP and not usable beyond testing purposes. Especially Authentication is unfinished and untested.

## About

OpenShelf aspires to be a robust solution to self-host ebook libraries with minimal friction. The ultimate goal is that everyone with extremely basic knowledge of computers should be able to setup their own digital bookshelf, free of censorship and and without centralized control over content.

This repository contains the core OpenShelf service to host on your homeserver, VPS, RPi or old laptop.

## Goals

- **Sync and offline capabilities:** The official app is being built with offline use in mind and syncs with the server automatically (active WIP)
- **Low barrier of entry:** The performance of the core service is constantly tested against a Raspberry PI, so the cost of self-hosting is kept minimal.
- **Accessibility:** Extensive documentation is being worked on, both for end users and developers who want to build upon OpenShelf.

## Screenshots (Extremely early)

<img width="802" height="527" alt="image" src="https://github.com/user-attachments/assets/d75df2ee-b84f-4683-8e17-342cddc4bd0e" />



## Architecture

This project is organized in multiple repositories:

- This repo - Core OpenShelf service, written in TypeScript with Bun.js/Elysia and SQLite 
- [Cross-platform app](https://github.com/luishugoooo/openshelf_app) - Official app for on- and offline reading on all your devices, written in Flutter
- TBA - Web UI

## Contributing

This is currently a personal project with many design choices to be made. Once somewhat stable, PRs are welcome.

## License

The project is licensed under AGPL 3.0

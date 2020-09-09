# Library Bot
[![version](https://img.shields.io/github/tag/VChet/library-bot.svg?label=version)](https://github.com/VChet/library-bot/tags)
[![dep](https://img.shields.io/david/VChet/library-bot.svg?style=flat)](https://david-dm.org/VChet/library-bot)
[![devDep](https://img.shields.io/david/dev/VChet/library-bot.svg?label=devDependencies)](https://david-dm.org/VChet/library-bot?type=dev)
[![CC](https://img.shields.io/badge/Conventional%20Commits-1.0.0-green.svg)](https://conventionalcommits.org)

Uses Node.js, MongoDB, Telegraf.js

## Features
* Book borrowing/returning
* List of book borrowers
* List of available/taken books
* Search by book name/author
* User validation (requires account approval by another user)
* Book editing (add new, edit, archive)
* List of categories with a book count
* Books import from excel file
* Inline-mode: book search and its current status

## Usage
1. Clone repository
1. Install [Node.js](https://nodejs.org/en/download/package-manager/)
1. Install all dependencies `npm install`
1. Copy `.env.template`, rename it to `.env` and configure.
    ```sh
    cp .env.template .env
    ```
1. Connect to database (skip if using remote DB)
    * Install [mongoDB](https://www.mongodb.com/download-center/community)
    * Start database `mongod`
1. Start bot `npm start`

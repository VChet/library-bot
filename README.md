# Library Bot
[![version](https://img.shields.io/github/tag/VChet/library_bot.svg?label=version)](https://github.com/VChet/library_bot/tags)
[![dep](https://img.shields.io/david/VChet/library_bot.svg?style=flat)](https://david-dm.org/VChet/library_bot)
[![devDep](https://img.shields.io/david/dev/VChet/library_bot.svg?label=devDependencies)](https://david-dm.org/VChet/library_bot?type=dev)
[![CC](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Uses Node.js, MongoDB, Telegraf.js

## Features
* Search book
* Borrow book
* Return book
* Validate user*
* Add book*
* Edit book*
* Archive book*
* Import books from excel file*

<sub><sup>*available for admin role only</sup></sub>

## Usage
1. Clone repository.
1. Install [Node.js](https://nodejs.org/).
1. Install all dependencies `npm install`.
1. Install [mongoDB](https://www.mongodb.com/download-center/community).
1. Start database `mongod`.
1. Copy `config.template.js`, rename it to `config.js` and configure
1. Start bot `npm start`.

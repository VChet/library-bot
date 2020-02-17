# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.4.1](https://github.com/VChet/library-bot/compare/v1.4.0...v1.4.1) (2020-02-17)


### Bug Fixes

* **about:** add repository button to /about command output ([0560a83](https://github.com/VChet/library-bot/commit/0560a83cafad348063ebe9dc3df372f0334fa874))
* **paginator:** replace paginator buttons text with arrow emoji ([6459f4d](https://github.com/VChet/library-bot/commit/6459f4dd95f9d1ceb77b9b72208e16548a0605d2))

## [1.4.0](https://github.com/VChet/library-bot/compare/v1.3.2...v1.4.0) (2020-02-12)


### Features

* **book:** add action with history of book holders ([b71c414](https://github.com/VChet/library-bot/commit/b71c414551bbdf2d575325209947d3db485a2df8)), closes [#8](https://github.com/VChet/library-bot/issues/8)

### [1.3.2](https://github.com/VChet/library-bot/compare/v1.3.1...v1.3.2) (2020-02-06)


### Bug Fixes

* **book:** fix showing undefined user of taken book ([80d153e](https://github.com/VChet/library-bot/commit/80d153e0ab514a42b17730a58cd28e6e62775a9e))
* **paginator:** reset paginator page to first when returning to menu ([be3f967](https://github.com/VChet/library-bot/commit/be3f96783ebf579eaf61854f449bcec3611fdb9e)), closes [#5](https://github.com/VChet/library-bot/issues/5)

### [1.3.1](https://github.com/VChet/library-bot/compare/v1.3.0...v1.3.1) (2020-02-06)


### Bug Fixes

* **book:** fix empty data when selecting unavailable book ([25fae77](https://github.com/VChet/library-bot/commit/25fae77ef3b59c21628f2fdb46afca7214393c64))
* **user:** fix error when changing role ([1589f4a](https://github.com/VChet/library-bot/commit/1589f4ac557d02fd9117b8958289f4ec55f0f0da))

## [1.3.0](https://github.com/VChet/library-bot/compare/v1.2.1...v1.3.0) (2020-01-31)


### Features

* **book:** hide empty author field in paginator and selector ([ac059d0](https://github.com/VChet/library-bot/commit/ac059d04dd988246285dec9c5f01caeb4c85080f)), closes [#4](https://github.com/VChet/library-bot/issues/4)
* **category:** add category scene with list and change name function ([3d1562e](https://github.com/VChet/library-bot/commit/3d1562e816144742d217f1f1f53bcdb46b23e9b9)), closes [#2](https://github.com/VChet/library-bot/issues/2)
* **category:** show category name when taking/returning a book ([8df23fa](https://github.com/VChet/library-bot/commit/8df23faf65f0daff70a5d9fa7dc0d804a5a9f74d)), closes [#3](https://github.com/VChet/library-bot/issues/3)


### Bug Fixes

* **addBook:** fix wrong function name ([fe285b6](https://github.com/VChet/library-bot/commit/fe285b6fbc6b7d16df92cd9bc6b1cc7ea0f7d4a1))

### [1.2.1](https://github.com/VChet/library-bot/compare/v1.2.0...v1.2.1) (2020-01-29)


### Bug Fixes

* **user:** add full_name virtual field ([90e1b25](https://github.com/VChet/library-bot/commit/90e1b25)), closes [#1](https://github.com/VChet/library-bot/issues/1)



## [1.2.0](https://github.com/VChet/library-bot/compare/v1.1.0...v1.2.0) (2020-01-27)


### Features

* **about:** add /about command ([2385788](https://github.com/VChet/library-bot/commit/2385788))
* **category:** change category field type to ref, update related ([74e580f](https://github.com/VChet/library-bot/commit/74e580f))
* **excel parser:** parse file and change categories ([5449b5b](https://github.com/VChet/library-bot/commit/5449b5b))



## [1.1.0](https://github.com/VChet/library-bot/compare/v1.0.1...v1.1.0) (2020-01-24)


### Bug Fixes

* **error:** output errors to console ([8fa1d81](https://github.com/VChet/library-bot/commit/8fa1d81))
* **parser:** simplify upload logic ([48c4afa](https://github.com/VChet/library-bot/commit/48c4afa))


### Features

* **book:** add taken_by field ([199fc6d](https://github.com/VChet/library-bot/commit/199fc6d))
* **log:** log when book was taken and when it was returned ([2870ddc](https://github.com/VChet/library-bot/commit/2870ddc))
* **unavailableBooks:** add paginator ([279923b](https://github.com/VChet/library-bot/commit/279923b))



### [1.0.1](https://github.com/VChet/library-bot/compare/v1.0.0...v1.0.1) (2020-01-22)


### Bug Fixes

* **user:** pass whole object when updating role ([bfeb622](https://github.com/VChet/library-bot/commit/bfeb622))


### Features

* **book model:** remove line breaks from fields before saving ([e32c9ed](https://github.com/VChet/library-bot/commit/e32c9ed))



## [1.0.0](https://github.com/VChet/library-bot/compare/2ba8acf...v1.0.0) (2020-01-18)


### Bug Fixes

* **addBook:** show error when adding book with name that already exists ([01a3c0a](https://github.com/VChet/library-bot/commit/01a3c0a))
* **availableBooks:** add 'back to menu' button after book selection ([0824fc3](https://github.com/VChet/library-bot/commit/0824fc3))
* **availableBooks:** fix pagination when books <= 10 ([fdbdf1a](https://github.com/VChet/library-bot/commit/fdbdf1a))
* **availableBooks:** fix wrong button parameters order ([be0e463](https://github.com/VChet/library-bot/commit/be0e463))
* **book model:** set default user as null ([8dc18bc](https://github.com/VChet/library-bot/commit/8dc18bc))
* **book return:** move scene enter to separate action ([e9879a1](https://github.com/VChet/library-bot/commit/e9879a1))
* **books unavailable:** leave scene after books output ([1451b62](https://github.com/VChet/library-bot/commit/1451b62))
* **category:** change category field type from object ref to string ([e3b3e46](https://github.com/VChet/library-bot/commit/e3b3e46))
* **command:** change commands ([5a046c5](https://github.com/VChet/library-bot/commit/5a046c5))
* **excel parser:** check if author or name is from heading and ignore ([a53d633](https://github.com/VChet/library-bot/commit/a53d633))
* **excel parser:** skip headings row ([dd664f6](https://github.com/VChet/library-bot/commit/dd664f6))
* **paginator:** change variables names ([4e6b53a](https://github.com/VChet/library-bot/commit/4e6b53a))
* **paginator:** rearrange menu and back button ([c03834d](https://github.com/VChet/library-bot/commit/c03834d))
* **paginator:** replace bookPaginator with paginator ([d50a038](https://github.com/VChet/library-bot/commit/d50a038))
* **proxy:** set Agent to undefined, request it only with active flag ([b894fb7](https://github.com/VChet/library-bot/commit/b894fb7))
* **scene session:** store books in scene.session instead of session.user ([43b395c](https://github.com/VChet/library-bot/commit/43b395c))
* **sceneHandler:** rename actions ([b50c1c7](https://github.com/VChet/library-bot/commit/b50c1c7))
* **searchBook:** fix missing buttons ([cd280b3](https://github.com/VChet/library-bot/commit/cd280b3))
* **session:** check session on message and keyboard button click ([831dcc2](https://github.com/VChet/library-bot/commit/831dcc2))
* **unavailableBooks:** return message if there is no taken books ([45fa33f](https://github.com/VChet/library-bot/commit/45fa33f))
* **uploadBooks:** add number declaration for error message count ([33341c7](https://github.com/VChet/library-bot/commit/33341c7))
* **uploadBooks:** check if output exists ([414cfe9](https://github.com/VChet/library-bot/commit/414cfe9))
* **uploadBooks:** enhance output to show successful and failed inserts ([cd2b442](https://github.com/VChet/library-bot/commit/cd2b442))
* **uploadBooks:** fix parseXLSX function name ([5c0b334](https://github.com/VChet/library-bot/commit/5c0b334))
* **user model:** change default role to 'Guest' ([989a125](https://github.com/VChet/library-bot/commit/989a125))
* **users:** conditional promote/demote buttons ([43ee15d](https://github.com/VChet/library-bot/commit/43ee15d))


### Features

* **addBook:** add 'add book' scene ([82e3eeb](https://github.com/VChet/library-bot/commit/82e3eeb))
* **app:** add file for startup bot with Telegraf library ([c936d38](https://github.com/VChet/library-bot/commit/c936d38))
* **app:** add telegraf bot file ([036bb7f](https://github.com/VChet/library-bot/commit/036bb7f))
* **availableBooks:** add pagination ([05c56ac](https://github.com/VChet/library-bot/commit/05c56ac))
* **book:** check duplicates for both author and name fields ([e882a13](https://github.com/VChet/library-bot/commit/e882a13))
* **book return:** add scene to return taken books ([4798854](https://github.com/VChet/library-bot/commit/4798854))
* **book search:** add number declaration func, refactor keyboard arrays ([ee45056](https://github.com/VChet/library-bot/commit/ee45056))
* **book take:** remove take button if book is already taken ([2c52b97](https://github.com/VChet/library-bot/commit/2c52b97))
* **book take:** update book user when taking book ([2e55b94](https://github.com/VChet/library-bot/commit/2e55b94))
* **books:** do not show archived books in results ([01d6c84](https://github.com/VChet/library-bot/commit/01d6c84))
* **books available:** add scene with all not taken books ([9024e19](https://github.com/VChet/library-bot/commit/9024e19))
* **books unavailable:** add scene with taken books ([c3e0f26](https://github.com/VChet/library-bot/commit/c3e0f26))
* **bot:** add /books command, change take_book command ([e6577e5](https://github.com/VChet/library-bot/commit/e6577e5))
* **bot:** edit bot messages instead of reply ([12659da](https://github.com/VChet/library-bot/commit/12659da))
* **bot init:** add proxy support ([f3d94c3](https://github.com/VChet/library-bot/commit/f3d94c3))
* **bot init:** use proxy only when flag is set ([0a62de8](https://github.com/VChet/library-bot/commit/0a62de8))
* **command:** add new user to DB on /start ([a086235](https://github.com/VChet/library-bot/commit/a086235))
* **config:** flag that (dis)allows users to use bot without validation ([ca4d62c](https://github.com/VChet/library-bot/commit/ca4d62c))
* **docs:** add license, readme ([915c84e](https://github.com/VChet/library-bot/commit/915c84e))
* **editBook:** add 'edit book' scene ([17cfec7](https://github.com/VChet/library-bot/commit/17cfec7))
* **error:** add DB errors handler ([f69fcbf](https://github.com/VChet/library-bot/commit/f69fcbf))
* **init:** populate books collection only if set in config ([1b33031](https://github.com/VChet/library-bot/commit/1b33031))
* **init:** populate books from data file ([7d425bf](https://github.com/VChet/library-bot/commit/7d425bf))
* **keyboards:** add keyboards component ([613dde3](https://github.com/VChet/library-bot/commit/613dde3))
* **menu:** add separate scene for menu ([90b851a](https://github.com/VChet/library-bot/commit/90b851a))
* **middleware:** move updates between session and DB to middleware ([96fbec0](https://github.com/VChet/library-bot/commit/96fbec0))
* **paginator:** add paginator component for books and user scenes ([ded19ea](https://github.com/VChet/library-bot/commit/ded19ea))
* **returnBook:** if category exists - show it when returning the book ([7661350](https://github.com/VChet/library-bot/commit/7661350))
* **sceneHandler:** add admin role check as middleware ([acc2fe1](https://github.com/VChet/library-bot/commit/acc2fe1))
* **sceneHandler:** add middleware for checking guest role ([5d6c48d](https://github.com/VChet/library-bot/commit/5d6c48d))
* **sceneHandler:** check DB for role update on every 'Guest' message ([4a61702](https://github.com/VChet/library-bot/commit/4a61702))
* **sceneHandler:** enter menu scene on session update and /start ([d36e233](https://github.com/VChet/library-bot/commit/d36e233))
* **sceneHandler:** show menu on button click ([24c9bdf](https://github.com/VChet/library-bot/commit/24c9bdf))
* **sceneHandler:** update user data if it differs from 'ctx.from' ([4e25b46](https://github.com/VChet/library-bot/commit/4e25b46))
* **scenes:** add search book scene ([983e9dd](https://github.com/VChet/library-bot/commit/983e9dd))
* **searchBook:** add 'archive book' button ([247c601](https://github.com/VChet/library-bot/commit/247c601))
* **searchBook:** add 'return book' action to search ([db50c7a](https://github.com/VChet/library-bot/commit/db50c7a))
* **searchBook:** add interaction by inline buttons ([9a94f2f](https://github.com/VChet/library-bot/commit/9a94f2f))
* **session:** check session on every message ([6790212](https://github.com/VChet/library-bot/commit/6790212))
* **uploadBooks:** add 'upload books' scene ([8b4fdce](https://github.com/VChet/library-bot/commit/8b4fdce))
* **uploadBooks:** add proxy support to axios request ([c5b359c](https://github.com/VChet/library-bot/commit/c5b359c))
* **user model:** add guest role ([2ba8acf](https://github.com/VChet/library-bot/commit/2ba8acf))
* **user start:** store user data in session ([bb0a82c](https://github.com/VChet/library-bot/commit/bb0a82c))
* **users:** add paginator component in usersScene ([730dbf1](https://github.com/VChet/library-bot/commit/730dbf1))
* **users:** add users list with ability to promote/demote users ([aae82a2](https://github.com/VChet/library-bot/commit/aae82a2))

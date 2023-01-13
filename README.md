# Dropmix card swap utility

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## To run locally

Webapp: `npm run start`

## Info on running

Please read /public/guide.md for info around webapp and scripts
## Motivations

With this game removed from app stores Harmonix and Hasbro have created an incredible amount of electronic waste with those Dropmix boards; the primary motivation of this project is to try and ensure the game is as preservable as possible.

Regardless of Harmonix's efforts to keep servers up, the long term risks for preserving this game always were the relative fragility of the NFC chips within the cards themselves. Allowing the ability to ensure no individual card's data is directly tied to that card's rarity seemed a key step in ensuring the medium term accessibility of the game to people in the future.

## Assistance appreciated on the following

### Styling

Please don't change the structure or logic but obviously it can look a lot better. As this is a highly niche and technical project please don't waste time trying to make the interface mobile friendly for anything other than possibly the basic playlist swap page.

A lot of the UI is a bit confusing but I'm making an assumption the added functionality outweighs the initial learning curve. If anything is especially frustrating please provide an alternative suggestion when making a complaint.

### Additional control options

- filter by instrument (would require expanding database json files)
- sort tables (seemed likely to produce tons of bugs, but if you can get it running reliable go for it!)
- dynamic card swap assignment options (e.g. match power to power, instument to instrument, type to type)
- it might be safe to have two cards use the same data? I can't see why it wouldn't be, it would require a lot more database tweaks than I've included. If someone wants to apply an alternative option where that can be done absolutely go for it (this would allow more complex swaps to occur and multiple physical cards to represent the same card data)

### Guides

- Currently the Android package signing logic depends on Java 8 and I believe does not work for Android 11 onwards, an updated script that works with a more recent Java version would be massively appreciated.
- Scripts: I see no reason why the installations on both Android (via adb) and M1 macs couldn't be entirely scripted. 
- Possible electron app: Following on from the notes on scripts ^, it might be possible to streamline the process entirely within an electron application?

### Print sheet layout tweaks

I haven't validated the sizes but what would be ideal is if a docx file is generated which would print as many cards as possible to one page that would match the exact sizes of the original cards on an A4 page. Some kind of variant which inverts the black backgrounds and white text for ink presevations would also be amazing.

### Legalese

This is a utility for swapping the data of cards you already own. Starter deck cards are practically worthless whereas some season 2 cards are now worth so much that the risk of damage from playing with them is too high for most to consider leaving them out at a party. I would have to imagine it's therefore totally okay for you to let your less rare cards stand in for these as you own the card in question that the data depends on. That being said it would be good to have some disclaimers on this info.

As far as I'm aware the only content in this repo which may be legally questionable is:

- the card image data (for pure UI reasons)
- the default database files (to save people from having to dig through their own folders)

Due to the product being discontinued I am assuming the owners of these properties won't mind me attempting to ensure their product remains usable; however if I receive any clear legal requests to remove such content I will do so.
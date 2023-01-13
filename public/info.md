## Notes on preserving a mixed media NFC based card game

Dropmix is a card game created by Harmonix which uses NFC chips in cards to trigger audio on an app via an NFC reading boardgame. This posed two issues for preservation:

1.  The application depends on a server to obtain content and therefore will no longer be operational for new users when the server goes down
2.  Due to the form factor of the cards, the NFC chips contained within are highly fragile and will inevitably cease to work over time. For later period cards this the combination of their rarity, their resale price and their fragility makes them almost unattainable and practically unusable for most people

### 1 Server closure

Epic acquired Harmonix in 2022 and subsequently announced the deprecation of numerous live services, hasting the process of preserving the game.

#### Basic fix:

As of now the easiest way to preserve this data is to sideload it into the app and works reliably. This has been confirmed to work with slightly modded versions of the application too. [https://archive.org/details/harmonix-drop-mix-android-v-1.9.0-obb-data](https://archive.org/details/harmonix-drop-mix-android-v-1.9.0-obb-data)

M1 Macs are able to run the application provided data is loaded in the relevant local container folder; it would appear jailbroken iPhones may be able to follow a similar process but I know nothing about them.

#### Potential server fix:

From digging into the application files of the iOS verions I found SQL databases in `/Data/Library/Caches/com.harmonix.dropmix/Cache.db`, which revealed the servers to attain data are:

*   Images iOS: `https://d1sdrdaxdi16ay.cloudfront.net/cards/images/ios/[formattedHash]/[cti]?Expires=[timestamp]&Signature=[sig]&Key-Pair-Id=[kp]`
*   Images Android: `https://d1sdrdaxdi16ay.cloudfront.net/cards/images/and/[formattedHash]/[cti]?Expires=[timestamp]&Signature=[sig]&Key-Pair-Id=[kp]`
*   Audio: `https://d1sdrdaxdi16ay.cloudfront.net/cards/audio/[formattedHash]/[cti]?Expires=[timestamp]&Signature=[sig]&Key-Pair-Id=[kp]`

With the variables being:

*   `cti`: refers to a value included in the card database (found within unity asset file `level0`)
*   `formattedHash`: a derived sha512 hash of the cti which is structured in the format of `fullHash.substring(0,2) + '/' + fullHash.substring(2,4) + '/' + fullHash.substring(4,6)`
*   `timestamp`: an expiration date, not sure what for
*   `sig`: 344 character long string
*   `kp`: 14 character string

I have collected the exact results of each of these requests for all 440 cards; I also tried all the remaining 65095 possible CTIs to see if I could find any unreleased cards with no success (although my script wasn't super thorough about logging error messages

I think there may be some earlier initial setup endpoints to get some other assets such as fonts. If all follow the `https://d1sdrdaxdi16ay.cloudfront.net` then a new server could be created by modifying wherever that value is stored

### 2 Card NFC failure

The form factor of the cards mean they are heavily prone to failure over time. They do not use a standard NFC protocol ([https://www.reddit.com/r/dropmix/comments/igpl9k/diy\_cards/](https://www.reddit.com/r/dropmix/comments/igpl9k/diy_cards/)) so the process of recreating NFCs is unlikely to yield results even without considering the issues around maintaining the form factor of the existing mass produced cards.

A less optimal but ultimately easier to achieve solution is to focus on improving accessibility to the card data within the application so that cards can be serve as slaves for other cards. This ultimately means a user only needs 60 functional unique cards to play a full game.

#### Improving card accessibility via app mods

The NFC chips contain little more than an associated ID which is then referenced to the card database (located within the `level0` unity asset file) to populate the data within the app. The application builds successfully with no issues from basic modifications to this database on two conditions:

##### level0

This asset file contains a comma separated table with the following quirks:

1.  The data is byte sized but stores in 32 bit blocks (so row that's 13 characters long will be 16 bytes long)
2.  Each row specifies the correct length of the data in that row at the prior to each entry
3.  The last column (copyright info) may contain commas
4.  Each row contains a newline character at the end in Android (but not on iOS)

Each card's ID is used to reference the data in this table.

You can get this file via:

*   iOS/M1: `/DropMix.app/WrappedBundle/Data/level0`
*   Android: Decompile apk; `/assets/bin/Data/level0.split4` (may be .split3 for some versions of the application)

### Card data swap solution

With this in mind I have made an application which allows two swap options:

1.  swap playlists in their entirety
2.  build up a list of cards owned in a set, select ones you own but don't want and the ones you don't have that you do want, then either manually or dynamically swap the cards
3.  produces an optional printable document of the new cards to place in sleeves with the cards you've swapped them with

As the IDs for NFCs are not a uniform length I opted to modify the length of the last copyrightable field to adjust to this. This ensures each row is the same length as it was before (which is probably overengineered as a straight swap should preseve DB length); there's potentially room for a very detailed database modifier in here but it didn't seem worth the time investment and would've made me go insane.

### Possible future work

#### Custom cards

I don't understand how images work but beyond that I know a fair bit of how to make custom cards work.

Due to the complexity of it all I think it would be better for someone to focus on migrating Fuser tracks (custom or official) back to Dropmix. The data structures are extremely similar so I think it should be very possible for someone who wants to do it (I don't).

To get custom cards running you need to modify the card data in the `level0` database to correspond with audio files placed in the card data section. There's quite a lot of undocumented config stuff from there but beyond the power (set in sharedassets0), the rendered text (set in level0) and some core audio details (e.g. initial tempo and pitch) you can control most the stuff from the data folders with little risk of corrupting the app

#### Improved scripting

I think it'd be amazing if someone made a script which works on as many platforms as possible and sideloads the apk and data directly to a person's phone. my `apkinstall.sh` script attempts to achieve this but much better can be done.


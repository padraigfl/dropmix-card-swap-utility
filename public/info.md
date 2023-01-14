## Notes on preserving a mixed media NFC based card game

Dropmix is a card game created by Harmonix which uses NFC chips in cards to trigger audio on an app via an NFC reading boardgame. This posed two issues for preservation:

1.  The application depends on a server to obtain content and therefore will no longer be operational for new users when the server goes down
2.  Due to the form factor of the cards, the NFC chips contained within are highly fragile and will inevitably cease to work over time. For later period cards this the combination of their rarity, their resale price and their fragility makes them almost unattainable and practically unusable for most people

The system I've devised focuses on 2 but I have looked somewhat into 1 and think a more experienced Unity modder could potentially resolve it.

### 1 Server closure

Epic acquired Harmonix in 2022 and subsequently announced the deprecation of numerous live services, hasting the process of preserving the game as the game relies on servers to populate the application with card data. This mainly consists of the art and music data for each card but may also include some other assets (most concerningly the game's text content seems to have issues that may suggest a server is required for the font)

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

The NFC chips contain little more than an associated ID which is then referenced to the card databases (located within the `level0` and `sharedassets0.assets` unity asset files) to populate the data within the app. The application builds successfully with no issues from basic modifications to this database on these conditions:

- the file remains the exact same size as before, with no surrounding content modified
- where necessary the prefix 32 bit asset length values are updated (one per table in shareassets0.assets, one per row in level0)
- the tables can be parsed in the same manner as before

There's probably more advanced mod work that could work around these constraints but I didn't want to make it harder on myself than necessary.

##### sharedassets0.assets

This asset file contains 3 comma separated tables (season 1, season 2 and promo cards) which contain data relating to the card, most importantly:

- The row in the level0 table to refer to when playing audio and displaying card info (e.g. name, song title, copyright)
- The power of the card (I believe this dictates how loud it plays too but that may be handled by level0)

Other data included in this file includes the various achievements within the app; in some earlier versions of the APK (I think either 1.8.1 or 1.8.3) you can find information about unreleased cards from season 2 so it may be possible to unearth unreleased cards with some of this data if you can figure out either the CTI or some way to pull the data from the server.

You can get this file via:

*   iOS/M1: `/DropMix.app/WrappedBundle/Data/sharedassets0.assets`
*   Android: Decompile apk; `/assets/bin/Data/sharedassets0.assets.split194` (for v1.9.0; this will likely be located elsewhere on another version and potentially may be spread across two divisions)

##### level0

This asset file contains a comma separated table with the following quirks:

1.  The data is byte sized but stores in 32 bit blocks (so row that's 13 characters long will be 16 bytes long)
2.  Each row specifies the correct length of the data in that row at the prior to each entry
3.  The last column (copyright info) may contain commas
4.  Each row contains a newline character at the end in Android (but not on iOS)

This data determines how cards are treated and rendered within the audio player aspect of the application (with the exception card power, which may be handled in sharedassets0.assets). For creating custom cards the bulk of work would be done within this table and editing the card asset files themselves.

You can get this file via:

*   iOS/M1: `/DropMix.app/WrappedBundle/Data/level0`
*   Android: Decompile apk; `/assets/bin/Data/level0.split4` (may be .split3 for some versions of the application)

### Card data swap solution

With this in mind I have made an application which allows two swap options:

1.  swap playlists in their entirety
2.  build up a list of cards owned in a set, select ones you own but don't want and the ones you don't have that you do want, then either manually or dynamically swap the cards
3.  produces an optional printable document of the new cards to place in sleeves with the cards you've swapped them with [buggy at the moment]

I initially worked with `level0`; as the IDs for NFCs are not a uniform length I opted to modify the length of the last copyrightable field to adjust to this. This ensures each row is the same length as it was before (which is probably overengineered as a straight swap should preseve DB length); there's potentially room for a very detailed database modifier in here but it didn't seem worth the time investment and would've made me go insane.

However, having some issues around Power values with level0, I switched to modifying `sharedassets0.assets`; this file does not grant the leeway of the massive copyright text field to modify so I instead mangle the (seemingly unused) track title data. The level0 modification tools still remain on the repo if they may serve some use in the future for someone.

### Possible future work

Spitballing here, some things are tied to the webapp specifically but some are more about long term preservation of the application.

#### Utilise extra card data for sorting/filtering

- instruments
- bars of music on card
- playlist
- select all limited to currently filtered selection

#### Dynamic card swap systems

As the user can outline which cards they want to get rid of and which they want, they could potentially let this process automatic swaps such as the following:

- matching power levels
- matching card types
- matching instruments
- prioritisation level of swaps by types (e.g. prioritise receiving wilds and getting rid of HMX or FX)
- prioritisation of unlicensed cards (for playing over streams)

#### Custom cards

I don't understand how images work but beyond that I know a fair bit of how to make custom cards work.

Due to the complexity of it all I think it would be better for someone to focus on migrating Fuser tracks (custom or official) back to Dropmix. The data structures are extremely similar so I think it should be very possible for someone who wants to do it (I don't).
The _one_ exception to this issue of work vs reward would be making some unlicensed Wild cards; I think it'd be really cool if someone built up a few unlicensed wild cards to swap the starter wild cards with. Beyond that I assume it's okay to play with the Harmonix made tracks so that's the one barrier from it being streamable as far as I can see.

To get custom cards running you need to modify the card data in the `level0` database to correspond with audio files placed in the card data section (`/android/data/com.hasbro.dropmix/Data/Documents/CardAssets/` and `~/Library/Containers/[UUID]/Data/Documents/CardAssets/`). There's quite a lot of undocumented config stuff from there but beyond the power (set in sharedassets0), the rendered text (set in level0) and some core audio details (e.g. initial tempo and pitch) you can control most the stuff from the data folders with little risk of corrupting the app

#### Improved scripting

I think it'd be amazing if someone made a script which works on as many platforms as possible and sideloads the apk and data directly to a person's phone. my [`apkinstall.sh`](https://github.com/padraigfl/dropmix-card-swap-utility/blob/master/scripts/apkInstall.sh) script attempts to achieve this but much better can be done.


#### A wiki for app preservation

Currently there's no centralised location for any information around how to use the app beyond some extremely good google sheets pages. With both the reddit and discord being ran by Harmonix discussion around such things was heavily stifled. There's already a lot of lost information around how the NFC protocol works (broken links on reddit posts) so it'd be good for it all to be collected somewhere and allow others to add in what they know where possible.

Some things I could imagine being very useful to have all in the one place:

- Info for running on all compatible devices (including an issues log around various versions of OSes)
- Possible solutions for cards that aren't working (heat gun, wireless charger, etc)
- Efforts around modding both Dropmix and Fuser and known similarities between the two
- Known projects around the application (e.g. I think someone figured out a way to play online?)
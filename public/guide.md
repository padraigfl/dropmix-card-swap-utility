## Guides

** WARNING: Please back up your application and data prior to attempting these updates. If you are not comfortable with any of the tools involved or do not know how to easily back up and restore your data you should not try this process. Ideally try on a device other than your main dropmix device if possible.**

Firstly generate a new source database file, for info on finding one within your version of the application see below.

### Webapp stage

- select a database to modify (either upload or select from available options)
- go to either
  - A: https://dropmix.netlify.app/collection
    - select cards/playlists you can use
    - select cards/playlists you want
    - select cards/playlists you can use and want to dispose of
  - B: https://dropmix.netlify.app/playlist
    - select playlists to exchange
    - for playlists with a baffler you have the option to swap the baffler too (this is probably buggy)
- from the dropdown options swap between cards/playlists, when you apply a swap it will be applied both on the row you've swapped and the row it was swapped with. To cancel either select the default option or hit the cancel button
- once some swaps have been applied you can click on the swap database button, which will open a modal and let you download the new database along with a printsheet of the desired swapped cards
- rename to match the original file name and place it within the application code where relevant (differs for mac and android)

### M1 macOS

__Please note I have had a bunch of weird behaviour with this so I cannot guarantee it works and would recommend you back up both the app and all corresponding data (found within ~/Library/Containers/[dropmix folder] ) and can verify you are able to restore it with ease.__

While I do not have a jailbroken iPhone I suspect at least some of the information here will apply there too as it is the same application

#### Source data file location

`/Applications/DropMix.app/WrappedBundle/Data/sharedassets0.assets`

#### Post-database update

1. Run the Dropmix app at least one time
1. Attempt to download all card content from the server if you have not already got it
1. If the server fails copy and paste card data from another source into the corresponding folder in `~/Library/Containers` (it will appear as Dropmix in the Finder but a UUID in the terminal)
1. Validate app still runs and card data still works
1. Close the applicate
1. swap the existing `/Applications/DropMix.app/WrappedBundle/Data/sharedassets0.assets0` file with the freshly updated asset file
1. Reopen, cards should now correspond with the updated database

### Android

See possible script based solution in the repo at /scripts/apkmod.sh 

#### Requirements

- https://github.com/iBotPeaches/Apktool
- an apk signing tool (e.g. https://github.com/techexpertize/SignApk )
- Java (version depends on signing tool used)
- a hex editor

#### Source data file location

1. Use apktool to unpack the apk you wish to update `apktool d -rf $APK_PATH -o $APK_DIR`
1. Find the asset file at `$APK_DIR/assets/bin/data/`
1. Depending on the version of the APK, the database may be located within a different chunk of the sharedassets0.assets folder; to find out which you will need a hex editor and to use the one which contains the following string: `CID,Artist,Name,Audio,Illustrator,Image,Type,Num Bars`, For 1.9.0 it is in `/assets/bin/data/sharedassets0.assets.split194`

#### Post-database update

1. If you have not already unpacked the apk file, do so as in the previous section
1. Copy the updated database file to the relevant location (e.g. replace $APK_DIR/assets/bin/data/level0.split4 with the new file)
1. Rebuild the apk with [apktool](https://github.com/iBotPeaches/Apktool)
1. Before installing you need to sign the new APK, I used https://github.com/techexpertize/SignApk to achieve this but it may not work for more recent versions of Android
1. Install on your device
1. If the install fails you may need to delete the existing version of Dropmix on your device, swapping between multiple modded versions of the app should not have this issue provided they were all signed in the same manner
1. If the server is down you will need to copy the obb and data files from an archived source into your application before the app will run (/scripts/apkinstall.sh makes efforts to streamline this process)

#### Notes

- As it's extremely easy to switch between modded APKs provided they're all signed the same way, I _strongly_ recommend being consistent with the signing process and including a resigned version of the original application. Doing this means you can install whichever modded version you want at any point without needing to to reapply the data files (so you could exit one mod, install another and be playing with a completely different deck in less than a minute)

### Scripts

#### `/scripts/apkmod.sh` (for webapp output data)

This script builds the modified APK files with updated card databases. To summarise:

- unpacks an existing APK
- checks a directory for modified files, any which match the size of the one within the unpacked app directory will be added to the app
- repacks APK with modified files
- signs the APK so it installs on android devices (note: if your existing version of the app is not signed in the same manner the new version will not install so it's recommended to make a re-signed version of the original application)
- outputs the signed APKs to a new directory where the script was ran from

To run: `./scripts/apkmod.sh [arg1] [arg2] [arg3]`
arg1 = directory of apk to mod
arg2 = directory containing modified sharedassets files
arg3 = directory of SignAPK


Requirements:

- `https://github.com/techexpertize/SignApk`: for signing the new version of the app
- Java 8: The above signing repo relies on Java 8, would appreciate someone to update this with a newer equivalent which works
- updated asset files (build using the app)


#### `/scripts/apkinstall.sh`

This script pulls the apk + data file from archive.org and puts it onto an android device connected

Requirements:

- admin permissions (not sure why, the unzipped file won't work without `sudo`; please let me know how to resolve this)
- `adb`
- ONE Android device connected via USB with debugging enabled
- a Linux/Mac terminal to run commands in (I imagine wsl is okay?)

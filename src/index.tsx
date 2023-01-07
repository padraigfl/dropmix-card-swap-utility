import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
import App from './App';
import { CardOwnershipWrapper } from './Ownership/CardOwnership';
import { PlaylistWrapper } from './Playlist/Playlist';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <>Something went wrong and I'm not sure what it was</>,
    children: [
      { path: 'collection', element: <CardOwnershipWrapper /> },
      { path: 'playlist', element: <PlaylistWrapper /> },
      { path: '/', element: (
        <>
          <p>This website aims to allow users to let their less valuable cards stand in for rarer cards by swapping their corresponding data within the application</p>
          <p>The system has two different interfaces for which to handle this:</p>
          <ol>
            <li>A basic playlist swapping tool: <Link to="/playlist">/playlist</Link></li>
            <li>A more advanced collection building tool with the ability to filter card types and switch between card and playlist views: <Link to="/collection">/collection</Link></li>
          </ol>
          <p>For a more detailed breakdown of how this website came to be and it's users, view the <Link to="/info">/info</Link> page (to be completed)</p>
          <p>For guides on how to use this website, please check out the <Link to="/guide">/guide</Link> section</p>
          <p>
            If you've found something here useful and would like to show some gratitude, please consider some of the following:
          </p>
          <ul>
            <li>Viewing my <Link to="/about-me">/about-me</Link> page to check out some other things I've done</li>
            <li>Assisting with improving the  <Link to="/guide">/guide</Link> section, I want to make the Android steps as simple as possible. I feel like it should be possible to place it all within a script with adb</li>
            <li>Sending me some of the cards I don't have; (currently I only have the starter decks, derby, mirrors, ouroboros, astro and discovery series 1&2)</li>
            <li><a href="https://www.buymeacoffee.com/padraig" target="_blank" rel="noreferrer">buymeacofffee</a></li>
          </ul>
        </>
      ) },
      { path: 'info', element: <>
        <h2 id="notes-on-preserving-a-mixed-media-nfc-based-card-game">Notes on preserving a mixed media NFC based card game</h2>
        <p>Dropmix is a card game created by Harmonix which uses NFC chips in cards to trigger audio on an app via an NFC reading boardgame. This posed two issues for preservation:</p>
        <ol>
          <li>The application depends on a server to obtain content and therefore will no longer be operational for new users when the server goes down</li>
          <li>Due to the form factor of the cards, the NFC chips contained within are highly fragile and will inevitably cease to work over time. For later period cards this the combination of their rarity, their resale price and their fragility makes them almost unattainable and practically unusable for most people</li>
        </ol>
        <h3 id="1-server-closure">1 Server closure</h3>
        <p>Epic acquired Harmonix in 2022 and subsequently announced the deprecation of numerous live services, hasting the process of preserving the game.</p>
        <h4 id="basic-fix-">Basic fix:</h4>
        <p>As of now the easiest way to preserve this data is to sideload it into the app and works reliably. This has been confirmed to work with slightly modded versions of the application too.
        <a href="https://archive.org/details/harmonix-drop-mix-android-v-1.9.0-obb-data">https://archive.org/details/harmonix-drop-mix-android-v-1.9.0-obb-data</a></p>
        <p>M1 Macs are able to run the application provided data is loaded in the relevant local container folder; it would appear jailbroken iPhones may be able to follow a similar process but I know nothing about them.</p>
        <h4 id="potential-server-fix-">Potential server fix:</h4>
        <p>From digging into the application files of the iOS verions I found SQL databases in <code>/Data/Library/Caches/com.harmonix.dropmix/Cache.db</code>, which revealed the servers to attain data are:</p>
        <ul>
          <li>Images iOS: <code>https://d1sdrdaxdi16ay.cloudfront.net/cards/images/ios/[formattedHash]/[cti]?Expires=[timestamp]&amp;Signature=[sig]&amp;Key-Pair-Id=[kp]</code> </li>
          <li>Images Android: <code>https://d1sdrdaxdi16ay.cloudfront.net/cards/images/and/[formattedHash]/[cti]?Expires=[timestamp]&amp;Signature=[sig]&amp;Key-Pair-Id=[kp]</code></li>
          <li>Audio: <code>https://d1sdrdaxdi16ay.cloudfront.net/cards/audio/[formattedHash]/[cti]?Expires=[timestamp]&amp;Signature=[sig]&amp;Key-Pair-Id=[kp]</code></li>
        </ul>
        <p>With the variables being:</p>
        <ul>
          <li><code>cti</code>: refers to a value included in the card database (found within unity asset file <code>level0</code>)</li>
          <li><code>formattedHash</code>:  a derived sha512 hash of the cti which is structured in the format of <code>fullHash.substring(0,2) + '/' + fullHash.substring(2,4) + '/' + fullHash.substring(4,6)</code></li>
          <li><code>timestamp</code>: an expiration date, not sure what for</li>
          <li><code>sig</code>: 344 character long string</li>
          <li><code>kp</code>: 14 character string</li>
        </ul>
        <p>I have collected the exact results of each of these requests for all 440 cards; I also tried all the remaining 65095 possible CTIs to see if I could find any unreleased cards with no success (although my script wasn&#39;t super thorough about logging error messages</p>
        <p>I think there may be some earlier initial setup endpoints to get some other assets such as fonts. If all follow the <code>https://d1sdrdaxdi16ay.cloudfront.net</code> then a new server could be created by modifying wherever that value is stored</p>
        <h3 id="2-card-nfc-failure">2 Card NFC failure</h3>
        <p>The form factor of the cards mean they are heavily prone to failure over time. They do not use a standard NFC protocol (<a href="https://www.reddit.com/r/dropmix/comments/igpl9k/diy_cards/">https://www.reddit.com/r/dropmix/comments/igpl9k/diy_cards/</a>) so the process of recreating NFCs is unlikely to yield results even without considering the issues around maintaining the form factor of the existing mass produced cards.</p>
        <p>A less optimal but ultimately easier to achieve solution is to focus on improving accessibility to the card data within the application so that cards can be serve as slaves for other cards. This ultimately means a user only needs 60 functional unique cards to play a full game.</p>
        <h4 id="improving-card-accessibility-via-app-mods">Improving card accessibility via app mods</h4>
        <p>The NFC chips contain little more than an associated ID which is then referenced to the card database (located within the <code>level0</code> unity asset file) to populate the data within the app. The application builds successfully with no issues from basic modifications to this database on two conditions:</p>
        <h5 id="level0">level0</h5>
        <p>This asset file contains a comma separated table with the following quirks:</p>
        <ol>
          <li>The data is byte sized but stores in 32 bit blocks (so row that&#39;s 13 characters long will be 16 bytes long) </li>
          <li>Each row specifies the correct length of the data in that row at the prior to each entry</li>
          <li>The last column (copyright info) may contain commas</li>
          <li>Each row contains a newline character at the end in Android (but not on iOS)</li>
        </ol>
        <p>Each card&#39;s ID is used to reference the data in this table.</p>
        <p>You can get this file via:</p>
        <ul>
          <li>iOS/M1: <code>/DropMix.app/WrappedBundle/Data/level0</code></li>
          <li>Android: Decompile apk; <code>/assets/bin/Data/level0.split4</code> (may be .split3 for some versions of the application)</li>
        </ul>
        <h3 id="card-data-swap-solution">Card data swap solution</h3>
        <p>With this in mind I have made an application which allows two swap options:</p>
        <ol>
          <li>swap playlists in their entirety</li>
          <li>build up a list of cards owned in a set, select ones you own but don&#39;t want and the ones you don&#39;t have that you do want, then either manually or dynamically swap the cards</li>
          <li>produces an optional printable document of the new cards to place in sleeves with the cards you&#39;ve swapped them with</li>
        </ol>
        <p>As the IDs for NFCs are not a uniform length I opted to modify the length of the last copyrightable field to adjust to this. This ensures each row is the same length as it was before (which is probably overengineered as a straight swap should preseve DB length); there&#39;s potentially room for a very detailed database modifier in here but it didn&#39;t seem worth the time investment and would&#39;ve made me go insane.</p>
      </>
      },
      { path: 'guide', element: <>Guide to be added</>},
      {
        path: 'about-me',
        element: <>
          <h2>About Me</h2>
          <p>Hi, I'm a London-based frontend-developer who would love to make useful tools for other people but tend to get fixated on weird obscure things like this instead. This project was a great chance for me to get into areas I never thought I would around modding videogames and diving into source code so regardless of whether anyone uses this it was a great experience to have had.</p>
          <p>Some projects I've done in the past that were neat but ultimately quite rough around the edges were:</p>
          <ul>
            <li><a href="https://packard-belle.netlify.app">Packard Belle</a>: Windows 98 recreation in React (planning to revisit this with some wild React Context logic)</li>
            <li><a href="https://dvd-rom.netlify.app">DVD menu recreator</a>: A system for recreating DVD menus as websites</li>
            <li><a href="https://react-coursebuilder.netlify.app/">React Coursebuilder</a>: Coursera mimicking youtube playlist note taking tool</li>
            <li><a href="https://critics-lists.netlify.app/">Critics Lists</a>: Metacritic end of year list aggregator (I use this one loads and think its great tbh, but very much a thing made by me for me)</li>
          </ul>
          <p>Feel free to check out <a href="https://github.com/padraigfl">my githubgi</a> for more details.</p>
        </>
      }
    ]
  }
])

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

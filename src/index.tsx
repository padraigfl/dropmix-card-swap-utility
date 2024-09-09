import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
import App from './App';
import { MarkdownLoader } from './MarkdownLoader';
import { CardOwnershipWrapper } from './Ownership/CardOwnership';
import { PlaylistWrapper } from './Playlist/Playlist';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <>Something went wrong and I'm not sure what it was <Link to="/">Go home</Link></>,
    children: [
      { path: 'collection', element: <CardOwnershipWrapper /> },
      { path: 'playlist', element: <PlaylistWrapper /> },
      { path: '/', element: (
        <>
          <p>This website aims to cover some details around how Dropmix works and the potential modifications that could be applied to the game to ensure longer term preservation is possible.</p>
          <p>For a more detailed breakdown of how this website came to be and its uses, view the <Link to="/info">/info</Link> page</p>

          <h3>Java Dropmix Toolkit</h3>
          <p><Link to="/desktop">Full details</Link></p>
          <p>The current main focus of my work has been a Java based app which creates modified APK files and has the ability to directly install them to a connected device. Initial testing by other users has been fairly positive and there's a lot of room for expansion if people want to make other mods on the asset level.</p>
          <p>This is currently available to download on <a href="https://github.com/padraigfl/Java-Dropmix-Toolkit/releases" target="_blank" rel="noopener noreferrer">the project's Github releases section</a> and should work on most devices with relatively recent Java support.</p>

          <h3>Web based mod tools (no longer maintained)</h3>
          <p>This website also has two different interfaces for which to generate mods for dropmix, but does not apply these assets into a usable APK. For guides on how to use these web based solutions website, please check out the <Link to="/guide">/guide</Link> section. They are:</p>
          <ol>
            <li><Link to="/playlist">/playlist</Link>: A basic playlist swapping tool</li>
            <li><Link to="/collection">/collection</Link>: A more advanced collection building tool with the ability to filter card types and switch between card and playlist views</li>
            <li>Generation of docx files with cards printed off at roughly the exact same size as official cards; this is likely still useful with the java application, I just need to figure out how.</li>
          </ol>

          <h3>Reporting Issues</h3>
          <p>For issues with the website or the scripts associated with it you can log them at <a href="https://github.com/padraigfl/dropmix-card-swap-utility" target="_blank" rel="noopener noreferrer">the github repo</a>, issues around the desktop tool should be logged at <a href="https://github.com/padraigfl/Java-Dropmix-Toolkit/" target="_blank" rel="noopener noreferrer">its github repo</a></p>
          <p>
            If you've found something here useful and would like to show some gratitude, please consider some of the following:
          </p>
          <ul>
            <li>Assisting with improving the  <Link to="/guide">/guide</Link> section, I want to make the Android steps as simple as possible. I feel like it should be possible to place it all within a script with adb</li>
            <li>Sending me some of the cards I don't have; (currently I only have the starter decks, derby, mirrors, ouroboros, astro and discovery series 1 & 2; would take a duplicate of the hall and oates one or a full starter deck too)</li>
            <li>Viewing my <Link to="/about-me">/about-me</Link> page to check out some other things I've done</li>
            <li><a href="https://www.buymeacoffee.com/padraig" target="_blank" rel="noreferrer">buymeacofffee</a></li>
            <li>Helping me with the <a href="https://github.com/padraigfl/dropmix-card-swap-utility#legalese" target="_blank" rel="noopener noreferrer">legal stuff</a> around this repo and site, at the moment I'm, assuming everyone involved would actively be happy someone is trying to ensure their massive amount of work and the remaining electronic waste can still be of some use</li>
          </ul>
          <p>I don't have any clear easy way to get in touch with me right now, but if you <a href="https://www.reddit.com/user/padraigfl" target="_blank" rel="noopener noreferrer">DM my reddit</a> or you provide me some contact details for you I can get in touch. Should be able to reply to bits of info on there or the Discord.</p>
          <p>Apologies for the low res video, but here is a quick run through of how easy it was to swap between multiple APKs modded using the <Link to="/guide#scripts">scripts</Link> and swap tools I've up here</p>
          <video src="/assets/demonstration.mp4" controls style={{ maxWidth: '100%', width: 540 }} />
        </>
      ) },
      { path: 'desktop', element: <MarkdownLoader file="/desktop.md" /> },
      { path: 'info', element: <MarkdownLoader file="/info.md" />
      },
      { path: 'guide', element: <MarkdownLoader file="/guide.md" /> },
      {
        path: 'about-me',
        element: <>
          <h2>About Me</h2>
          <p>Hi, I'm a London-based web-developer who would love to make useful tools for other people but tend to get fixated on weird obscure things like this instead.</p>
          <p>This project was a great chance for me to get into areas I never thought I would around modding videogames and diving into source code so regardless of whether anyone uses this it was a great experience to have had.</p>
          <p>Some other projects I've done in the past that were neat but ultimately quite rough around the edges include:</p>
          <ul>
            <li><a href="https://packard-belle.netlify.app" target="_blank" rel="noreferrer">Packard Belle</a>: Windows 98 recreation in React (planning to revisit this one and make a pretty elaborate simulation with a hard drive and process context)</li>
            <li><a href="https://dvd-rom.netlify.app" target="_blank" rel="noreferrer">DVD menu recreator</a>: A system for recreating DVD menus as websites (wish I could revisit this one)</li>
            <li><a href="https://critics-lists.netlify.app/" target="_blank" rel="noreferrer">Critics Lists</a>: Metacritic end of year list aggregator (I use this one loads and think its great tbh, but very much a thing made by me for me)</li>
            <li><a href="https://react-coursebuilder.netlify.app/" target="_blank" rel="noreferrer">React Coursebuilder</a>: Coursera mimicking youtube playlist note taking tool</li>
          </ul>
          <p>Feel free to check out <a href="https://github.com/padraigfl" target="_blank" rel="noreferrer">my github</a> for more details.</p>
        </>
      }
    ]
  },
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

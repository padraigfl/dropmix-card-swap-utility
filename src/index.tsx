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
          <p><strong>WARNING: Please back up your application and data prior to attempting these updates. If you are not comfortable with any of the tools involved (e.g. java, apktool) or do not know how to easily restore your data you should not try this process.</strong></p>
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
            <li>Assisting with improving the  <Link to="/guide">/guide</Link> section, I want to make the Android steps as simple as possible. I feel like it should be possible to place it all within a script with adb</li>
            <li>Sending me some of the cards I don't have; (currently I only have the starter decks, derby, mirrors, ouroboros, astro and discovery series 1&2)</li>
            <li>Viewing my <Link to="/about-me">/about-me</Link> page to check out some other things I've done</li>
            <li><a href="https://www.buymeacoffee.com/padraig" target="_blank" rel="noreferrer">buymeacofffee</a></li>
          </ul>
        </>
      ) },
      { path: 'info', element: <MarkdownLoader file="/info.md" />
      },
      { path: 'guide', element: <MarkdownLoader file="/guide.md" /> },
      {
        path: 'about-me',
        element: <>
          <h2>About Me</h2>
          <p>Hi, I'm a London-based frontend-developer who would love to make useful tools for other people but tend to get fixated on weird obscure things like this instead. This project was a great chance for me to get into areas I never thought I would around modding videogames and diving into source code so regardless of whether anyone uses this it was a great experience to have had.</p>
          <p>Some projects I've done in the past that were neat but ultimately quite rough around the edges include:</p>
          <ul>
            <li><a href="https://packard-belle.netlify.app" target="_blank" rel="noreferrer">Packard Belle</a>: Windows 98 recreation in React (planning to revisit this one)</li>
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

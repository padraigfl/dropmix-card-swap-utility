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
      { path: 'card', element: <CardOwnershipWrapper /> },
      { path: 'playlist', element: <PlaylistWrapper /> },
      { path: 'home', element: (
        <>
          <h1>Dropmix Card Swap Utility</h1>
          <p>This website aims to allow users to let their less valuable cards stand in for rarer cards by swapping their corresponding data within the application</p>
          <p>For a more detailed breakdown of how this website came to be and it's users, view the <Link to="/info">/info</Link> page</p>
          <p>For guides on how to use this website, please check out the <Link to="/">/guide</Link> section</p>
          <p>
            If you've found something here useful and would like to show some gratitude, please consider some of the following:
          </p>
          <ul>
            <li>Viewing my <Link to="/about-me">/about</Link> page to check out some other things I've done</li>
            <li>Assisting with improving the  <Link to="/">/guide</Link> section, I want to make the Android steps as simple as possible. I feel like it should be possible to place it all within a script with adb</li>
            <li>Sending me some of the cards I don't have; (currently I only have the starter decks, derby, mirrors, ouroboros, astro and discovery series 1&2)</li>
            <li><Link to="https://www.buymeacoffee.com/padraig">buymeacofffee</Link></li>
          </ul>
        </>
      ) },
      { path: 'info', element: <>Please help me</> },
      { path: 'guide', element: <>Here is the guide</>},
      {
        path: 'about-me',
        element: <>
          <h2>About Me</h2>
          <p>Hi, I'm a London-based frontend-developer who would love to make useful tools for other people but tend to get fixated on weird obscure things like this instead. This project was a great chance for me to get into areas I never thought I would around modding videogames and diving into source code so regardless of whether anyone uses this it was a great experience to have had.</p>
          <p>Some projects I've done in the past that were neat but ultimately quite rough around the edges were:</p>
          <ul>
            <li>Windows 98 recreation in React (planning to revisit this with some wild React Context logic)</li>
            <li>A system for recreating DVD menus as websites</li>
            <li>Coursera youtube playlist note taking tool</li>
            <li>Metacritic end of year list aggregator (I use this one loads and think its great tbh, but very much a thing made by me for me)</li>
          </ul>
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

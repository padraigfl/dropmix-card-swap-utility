import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { DocxDownloader } from './components/DocxDownloader';
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
      { path: 'home', element: <DocxDownloader playlist="dapper" /> },
      { path: 'info', element: <>Please help me</> },
      { path: 'guide', element: <>Here is the guide</>}
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

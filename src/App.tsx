import { GameDatasetContextProvider } from './GameDataset/GameDatasetContext';
import './App.css';
import { Link, Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <h1>Dropmix Card Swap Utility</h1>
      <div>
        <Link to="/">Home</Link> |{' '}
        <Link to="/collection">Collection Manager</Link> |{' '}
        <Link to="/playlist">Playlist swap</Link> |{' '}
        <Link to="/info">Info</Link> |{' '}
        <Link to="/guide">Guide</Link> |{' '}
        <Link to="/about-me">About Me</Link>
      </div>
      <hr />
      <GameDatasetContextProvider>
        <Outlet />
      </GameDatasetContextProvider>
      <div id="modalPortal"></div>
    </div>
  );
}

export default App;

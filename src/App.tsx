import { GameDatasetContextProvider } from './GameDataset/GameDatasetContext';
import './App.css';
import { Link, Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <h1>Dropmix Card Swap Utility</h1>
      <div>
        <Link to="/">Home</Link> |{' '}
        <Link to="/info">Info</Link> |{' '}
        <Link to="/desktop">APK Modding Tool</Link> |{' '}
        <Link to="/collection">Collection Manager</Link> |{' '}
        <Link to="/about-me">About Me</Link> | {' '}
        <a href="https://github.com/padraigfl/dropmix-card-swap-utility" target="_blank" rel="noopener noreferrer">github</a>
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

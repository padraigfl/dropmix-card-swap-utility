import { GameDatasetContextProvider } from './GameDataset/GameDatasetContext';
import './App.css';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <GameDatasetContextProvider>
        <Outlet />
      </GameDatasetContextProvider>
      <div id="modalPortal"></div>
    </div>
  );
}

export default App;

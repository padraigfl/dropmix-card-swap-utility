import { GameDatasetContextProvider } from './GameDataset/GameDatasetContext';
import { CardOwnershipWrapper } from './Ownership/CardOwnership';
import './App.css';

function App() {
  return (
    <div className="App">
      <GameDatasetContextProvider>
        <CardOwnershipWrapper />
      </GameDatasetContextProvider>
      <div id="modalPortal"></div>
    </div>
  );
}

export default App;

import React, { useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import { databaseParser } from './tools/parseDatabase';

function App() {

  const handleFile = useCallback((e: any) => {
    var reader = new FileReader();
    reader.onload = function() {
      const arrayBuffer = this.result as ArrayBuffer;
      const array8 = new Uint8Array(arrayBuffer);
      const startIndex = databaseParser(array8);
      debugger;
    }
    reader.readAsArrayBuffer(e.target.files[0]);

  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <input type="file" onChange={handleFile} />
      </header>
    </div>
  );
}

export default App;

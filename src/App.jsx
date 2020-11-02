import React from 'react';

import MenuBar from './library/components/MenuBar/MenuBar';
import DataHandler from './library/components/DataHandler';
import MainWindow from './library/components/MainWindow/MainWindow'

function App() {
  return (
    <DataHandler>
      <MenuBar />
      <MainWindow />
    </DataHandler>
  );
}

export default App;

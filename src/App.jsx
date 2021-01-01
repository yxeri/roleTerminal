import React from 'react';

import MenuBar from './library/components/MenuBar/MenuBar';
import MainWindow from './library/components/MainWindow/MainWindow';

function App() {
  return (
    <>
      <React.StrictMode>
        <MenuBar />
        <MainWindow />
      </React.StrictMode>
    </>
  );
}

export default App;

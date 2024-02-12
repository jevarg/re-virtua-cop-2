import { useContext } from 'react';
import { MainContext } from './contexts/MainContext';
import { Button } from './utils/ButtonFix';
import { Explorer } from './components/Explorer';

function App() {
  const mainCtx = useContext(MainContext);

  if (!mainCtx.isGameDataLoaded) {
    return (
      <Button onClick={mainCtx.loadGameData}>
        Load
      </Button>
    );
  }

  return <Explorer />;
}

export default App;

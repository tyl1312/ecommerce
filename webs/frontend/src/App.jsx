import React from 'react';
import { BrowserRouter} from 'react-router-dom';
import MainSection from './pages/MainSection';

const App = () => {
  return (
    <BrowserRouter>
      <MainSection />
    </BrowserRouter>
  );
}

export default App;
import './App.css';
import Admin from './Pages/Admin';
import PIN from './Pages/Pin';
import Home from './Pages/Home';
import {BrowserRouter,Routes,Route} from 'react-router-dom';


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/login' element={<PIN></PIN>}></Route>
        <Route path='/admin' element={<Admin></Admin>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

const App = () => { 
  return (
    <div className="app">
      <div className="header-wrapper">
        <Header />
      </div>

      <main className="main-content">
        <Outlet />
      </main>

      <div className="footer-wrapper">
        <Footer />
      </div>
    </div>
  );
};

export default App;

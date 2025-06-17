import { Routes, Route } from 'react-router-dom';
import App from './App';
import Chatbot from './pages/Chatbot';
import About from './pages/About';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/" element={<Chatbot />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
};
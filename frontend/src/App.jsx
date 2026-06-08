import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import VideoDetailPage from './pages/VideoDetailPage';
import AboutPage from './pages/AboutPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ContactPage from './pages/ContactPage';
import FluidInkBackground from './components/FluidInkBackground';
import LlmGeneratedComponent from './components/LlmGeneratedComponent';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <FluidInkBackground />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/portfolio"    element={<PortfolioPage />} />
            <Route path="/portfolio/:id" element={<VideoDetailPage />} />
            <Route path="/about"        element={<AboutPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/contact"      element={<ContactPage />} />
            <Route path="/simulation"   element={<LlmGeneratedComponent />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

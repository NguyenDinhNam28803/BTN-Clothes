import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/fixes.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function AppWrapper() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: 'ease-out',
      disable: 'mobile',
      offset: 120,
      mirror: false,
      // Tắt AOS khi có transform để không ảnh hưởng sticky
      disableMutationObserver: false,
      anchorPlacement: 'top-bottom'
    });
    
    // Refresh AOS khi route thay đổi
    return () => {
      AOS.refresh();
    };
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);

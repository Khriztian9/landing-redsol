import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, login, logout } from './firebase';
import './App.css';
import MainNavbar from './components/MainNavbar';
import LandingContent from './components/LandingContent';
import AuthenticatedHomeNotice from './components/AuthenticatedHomeNotice';
import LoginModal from './components/LoginModal';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser && location.pathname === '/') {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('mainNavbar');
      if (!navbar) return;

      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      setError('');
      setShowLogin(false);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <>
      <a href="#contenido-principal" className="visually-hidden-focusable position-absolute top-0 start-0 m-2 p-2 bg-white text-dark rounded">
        Saltar al contenido principal
      </a>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MainNavbar
          user={user}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
        />

        {!user ? <LandingContent /> : <AuthenticatedHomeNotice />}
      </div>

      {showLogin && (
        <LoginModal
          email={email}
          password={password}
          error={error}
          onClose={() => setShowLogin(false)}
          onSubmit={handleLogin}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      )}
    </>
  );
}

export default App;

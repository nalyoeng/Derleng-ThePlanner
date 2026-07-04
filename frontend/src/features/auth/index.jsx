import Login from './Login';
import Register from './Register';
import { useState} from 'react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const handleSuccess = () => {
    // In a real app, you'd likely redirect to the home page or dashboard
    console.log("Authentication successful!");
  };
  if (mode === 'login') {
    return <Login onSuccess={handleSuccess} onRegister={() => setMode('register')} />;
  } else {
    return <Register onSuccess={handleSuccess} onLogin={() => setMode('login')} />;
  }
}

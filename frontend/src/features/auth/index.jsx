import Login from './Login'
import Register from './Register'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const isRegisterPage =
    location.pathname === '/register'

  const handleSuccess = () => {
    console.log('Authentication successful!')
  }

  if (isRegisterPage) {
    return (
      <Register
        onSuccess={handleSuccess}
        onLogin={() => navigate('/login')}
      />
    )
  }

  return (
    <Login
      onSuccess={handleSuccess}
      onRegister={() => navigate('/register')}
    />
  )
}
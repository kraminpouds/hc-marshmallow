import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin =  () => {
         // 发送登录请求到后端
       axios.post('/xumu/password', { username, password })
            .then(() => navigate('/xumu'))
            .catch(() => setErrorMessage('Incorrect username or password'));
    };

    return (
        <div>
            <h2>Login</h2>
            <div>
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
                <button onClick={handleLogin}>Login</button>
            </div>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </div>
    );
}

export default Login

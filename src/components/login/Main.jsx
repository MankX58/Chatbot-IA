import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";

function LoginMain() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError('Completa correo y contraseña.');
            return;
        }

        setError('');
        // Aquí puedes usar rememberMe si luego quieres guardar sesión persistente
        navigate('/home');
    }

    return (
        <main className='flex flex-col items-center p-4 w-full h-auto bg-gray-100'>
            <div className='bg-white p-8 rounded shadow-md w-full max-w-xl'>
                {/* ...existing code... */}
                <form onSubmit={handleSubmit}>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='username'>
                            Correo institucional
                        </label>
                        <input
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-red-800 *:focus:shadow-outline'
                            id='username'
                            type='email'
                            placeholder='usuario@udem.edu.co'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className='mb-6'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>
                            Contraseña
                        </label>
                        <input
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-red-800 focus:shadow-outline'
                            id='password'
                            type='password'
                            placeholder='********'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className='flex items-center justify-between'>
                            <label className='inline-flex items-center text-sm text-gray-700 cursor-pointer' htmlFor='rememberMe'>
                                <input
                                    id='rememberMe'
                                    type='checkbox'
                                    className='mr-2'
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Recordarme
                            </label>

                            <a href="#" className='text-xs text-red-500 hover:text-red-700 hover:underline'>¿Olvidaste tu contraseña?</a>
                        </div>
                    </div>

                    {error && <p className='text-red-600 text-sm mb-3'>{error}</p>}

                    <div className='flex items-center justify-between'>
                        <button
                            className='bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
                            type='submit'
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default LoginMain
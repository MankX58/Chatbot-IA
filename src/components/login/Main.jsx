import React, { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from "react-router-dom"

function LoginMain() {
    const navigate = useNavigate()
    const { loginWithRedirect, isLoading, isAuthenticated, error } = useAuth0()

    // Redirigir a home si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home')
        }
    }, [isAuthenticated, navigate])

    const handleLoginClick = async () => {
        try {
            await loginWithRedirect({
                appState: { returnTo: window.location.pathname }
            })
        } catch (err) {
            console.error('Error during login:', err)
        }
    }

    if (isLoading) {
        return (
            <main className='flex min-h-dvh w-full flex-col items-center justify-center bg-[#F8F6F6] px-4 py-8'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4'></div>
                    <p className='text-gray-700'>Cargando...</p>
                </div>
            </main>
        )
    }

    return (
        <main className='flex min-h-dvh w-full flex-col items-center bg-[#F8F6F6] px-4 py-4 sm:px-6'>
            <img 
            src="https://cta.org.co/waitro-rfp-web/wp-content/uploads/sites/8/2024/02/UDEM-3-1380x690.jpg" alt="img_udemedellin" 
            className='h-auto w-full max-w-xl rounded-t-2xl object-cover aspect-[16/9]'/>
            <div className='w-full max-w-xl rounded-b-2xl bg-white px-4 py-8 shadow-md sm:px-8 sm:py-10'>
                <h2 className='mb-6 text-center text-xl font-bold text-gray-800 sm:text-2xl'>Iniciar Sesión</h2>
                
                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        <p className='text-sm'>{error.message}</p>
                    </div>
                )}

                <div className='space-y-4'>
                    <button
                        onClick={handleLoginClick}
                        disabled={isLoading}
                        className='bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200'
                    >
                        {isLoading ? 'Conectando...' : 'Iniciar Sesión'}
                    </button>

                    <div className='relative my-6'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-300'></div>
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <span className='bg-white px-2 text-center text-gray-500'>o continúa con SSO institucional <br />en proceso...</span>

                        </div>
                    </div>

                    <p className='text-center text-sm text-gray-600 mt-6'>
                        ¿No tienes cuenta? <a href="#" className='text-red-700 hover:text-red-800 font-semibold'>Solicita acceso aquí</a>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default LoginMain
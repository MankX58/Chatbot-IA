import React from 'react'


function LoginHeader() {
return (
    <header className='flex flex-col items-center'>
            <div className='flex w-full items-center justify-between p-4 bg-gray-200'>
                    <img src="https://play-lh.googleusercontent.com/L4dVQTWEbS5NNjM4XVpc0cpz2E2KQsuaM4ht_4xoaqy8QECmiYXhy4UG9dWVrX3rxRM"
                     alt="Logo udem"
                     className='size-12' />
                    <h1 className='font-verdana text-center font-bold text-xl'>Universidad de Medellín</h1>
                    <button className='text-right bg-red-300 hover:bg-red-400 font-bold py-2 px-4 rounded text-red-700 hover:text-red-100'>Ayuda</button>
            </div>
            <img 
            src="https://cta.org.co/waitro-rfp-web/wp-content/uploads/sites/8/2024/02/UDEM-3-1380x690.jpg" alt="img_udemedellin" 
            className='w-full  h-52 object-cover max-w-xl'/>
    </header>
    )}

export default LoginHeader
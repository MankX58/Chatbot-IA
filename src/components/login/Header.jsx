import React from 'react'


function LoginHeader() {
return (
    <header className='flex flex-col items-center'>
            <div className='flex w-full max-w-xl flex-col items-center gap-3 bg-[#FFFFFF] p-4 sm:flex-row sm:justify-between'>
                    <img src="../../../public/UdeM Escudo.png"
                     alt="Logo udem"
                     className='size-10 sm:size-12' />
                    <h1 className='text-center font-bold text-lg sm:text-xl'>Universidad de Medellín</h1>
                    <button className='rounded bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-400 hover:text-red-100'>Ayuda</button>
            </div>
    </header>
    )}

export default LoginHeader
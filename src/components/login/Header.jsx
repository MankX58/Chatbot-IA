import React from 'react'


function LoginHeader() {
return (
    <header className='flex flex-col items-center'>
            <div className='flex w-full max-w-xl items-center justify-between p-4 bg-[#FFFFFF] m-0'>
                    <img src="../../../public/UdeM Escudo.png"
                     alt="Logo udem"
                     className='size-12' />
                    <h1 className='font-verdana text-center font-bold text-xl'>Universidad de Medellín</h1>
                    <button className='text-right bg-red-100 hover:bg-red-400 font-bold py-2 px-4 rounded text-red-700 hover:text-red-100'>Ayuda</button>
            </div>
    </header>
    )}

export default LoginHeader
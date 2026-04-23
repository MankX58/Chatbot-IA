import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

function UserProfile() {
    const { user, isAuthenticated, logout } = useAuth0()

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className='flex items-center gap-4'>
            {user?.picture && (
                <img 
                    src={user.picture} 
                    alt={user.name}
                    className='w-10 h-10 rounded-full'
                />
            )}
            <div>
                <p className='text-sm font-semibold text-gray-800'>{user?.name}</p>
                <p className='text-xs text-gray-600'>{user?.email}</p>
            </div>
            <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className='ml-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 text-sm font-semibold'
            >
                Cerrar Sesión
            </button>
        </div>
    )
}

export default UserProfile

import { AppBar } from '@/components/AppBar'
import React, { ReactNode } from 'react'
import { Toaster } from 'sonner'

const Authlayout = ({children}:{children:ReactNode}) => {
  return (
      <div className='flex items-center justify-center mx-auto max-w-7xl min-h-screen max-sm:px-4 max-sm:py-8'>
        <AppBar/>
          {children}

          <Toaster/>
    </div>
  )
}

export default Authlayout
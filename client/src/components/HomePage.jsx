import React from 'react'
import MarketingPanel from './MarketingPanel'
import AuthForm from './AuthForm'

const HomePage = () => {
  return (
    <div className="min-h-screen flex">
      <MarketingPanel />
      <AuthForm />
    </div>
  )
}

export default HomePage
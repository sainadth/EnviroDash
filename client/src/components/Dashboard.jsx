import React from 'react'
import Sidebar from './Sidebar'
import SensorMap from './SensorMap'

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 p-4 overflow-hidden">
        <SensorMap />
      </div>
    </div>
  )
}

export default Dashboard
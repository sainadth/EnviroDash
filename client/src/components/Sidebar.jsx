import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiChevronLeft, FiChevronRight, FiWind, FiCloud } from 'react-icons/fi';
import { logoutUser } from '../features/auth/authThunks';

const Sidebar = ({ onSensorTypeSelect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedType, setSelectedType] = useState('purpleair'); // Default to purpleair instead of 'all'
  const user = useSelector((state) => state.auth.user);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleSensorTypeSelect = (type) => {
    setSelectedType(type);
    onSensorTypeSelect?.(type);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={`h-screen bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex justify-end p-2">
        <button onClick={toggleSidebar}>
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center p-4 border-b border-gray-700">
        <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
              <FiUser size={24} />
            </div>
          )}
        </div>
        {!isCollapsed && (
          <span className="text-sm font-medium truncate">{user?.displayName || 'User'}</span>
        )}
      </div>

      {/* User Controls */}
      <div className={`flex flex-col space-y-4 mt-4 ${isCollapsed && 'items-center'}`}>
        <SidebarItem 
          icon={<FiCloud />} 
          label="PurpleAir" 
          isCollapsed={isCollapsed}
          isActive={selectedType === 'purpleair'}
          onClick={() => handleSensorTypeSelect('purpleair')}
        />
        <SidebarItem 
          icon={<FiWind />} 
          label="AcuRite" 
          isCollapsed={isCollapsed}
          isActive={selectedType === 'acurite'}
          onClick={() => handleSensorTypeSelect('acurite')}
        />
        <div className="border-t border-gray-700 my-4"></div>
        <SidebarItem 
          icon={<FiLogOut />} 
          label="Logout" 
          isCollapsed={isCollapsed}
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, isCollapsed, onClick, isActive = false }) => (
  <div 
    className={`flex items-center ${isCollapsed ? 'space-x-0 p-3' : 'space-x-3 p-3'} 
    ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'} cursor-pointer transition-colors duration-200`}
    onClick={onClick}
  >
    {icon}
    {!isCollapsed && <span>{label}</span>}
  </div>
);
export default Sidebar;

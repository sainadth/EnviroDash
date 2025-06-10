const MarketingPanel = () => {
  const svgPattern = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%23E5E7EB' stroke-width='0.5'/%3E%3C/svg%3E")`;

  return (
    <div className="w-1/2 min-h-screen backdrop-blur-sm flex flex-col rounded-md" 
      style={{
        backgroundImage: svgPattern,
        backgroundRepeat: 'repeat',
        backgroundSize: '20px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <div className='flex min-h-screen items-center justify-center p-8'>
        ADD slide show
      </div>
    </div>
  );
};

export default MarketingPanel;

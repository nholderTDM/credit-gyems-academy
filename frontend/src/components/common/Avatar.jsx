import React from 'react';

const Avatar = ({ name = '', image = null, size = 'md', className = '' }) => {
  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  // Get initials from name
  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return '';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const initials = getInitials(name);
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Base classes for avatar
  const baseClasses = `
    rounded-full
    flex
    items-center
    justify-center
    font-semibold
    text-slate-700
    bg-gradient-to-br
    from-slate-200
    to-slate-300
    border-2
    border-white
    shadow-sm
    ${sizeClass}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  if (image) {
    return (
      <div className={baseClasses}>
        <img
          src={image}
          alt={name || 'User avatar'}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = initials;
            e.target.parentNode.classList.add('bg-gradient-to-br', 'from-slate-200', 'to-slate-300');
          }}
        />
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {initials || '?'}
    </div>
  );
};

export default Avatar;
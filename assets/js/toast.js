export function showToast(message, type = 'success') {
  // Create container if not exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '10000',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    });
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  
  // Styles based on type
  const colors = {
    success: { bg: '#fff', border: '#4caf50', text: '#333', icon: '✅' },
    error: { bg: '#fff', border: '#f44336', text: '#333', icon: '❌' },
    info: { bg: '#fff', border: '#2196f3', text: '#333', icon: 'ℹ️' }
  };
  const theme = colors[type] || colors.info;

  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:1.2em;">${theme.icon}</span>
      <span style="font-weight:500;">${message}</span>
    </div>
  `;

  // Apply styles
  Object.assign(toast.style, {
    background: theme.bg,
    color: theme.text,
    padding: '16px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderLeft: `5px solid ${theme.border}`,
    minWidth: '250px',
    maxWidth: '350px',
    opacity: '0',
    transform: 'translateX(50px)',
    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem'
  });

  container.appendChild(toast);

  // Animate In
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // Auto Dismiss
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => {
      if(toast.parentElement) toast.remove();
    }, 400);
  }, 3000);
}

// 공통 스타일 정의
export const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999999999,
    padding: '20px',
    overflowY: 'auto' as const,
    transform: 'translateZ(0)'
  },
  content: {
    width: '100%',
    maxWidth: '600px',
    transform: 'scale(1.05)',
    transformOrigin: 'center center',
    marginTop: 'auto',
    marginBottom: 'auto',
    transition: 'transform 0.3s ease'
  },
  closeButton: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    border: 'none',
    borderRadius: '50%',
    color: 'white',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999999999,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
  }
};

export const cardStyles = {
  container: {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#1F2937',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #374151'
  },
  imageContainer: {
    position: 'relative' as const,
    marginBottom: '20px',
    borderRadius: '12px',
    overflow: 'hidden',
    height: '180px',
    background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
  },
  badge: {
    position: 'absolute' as const,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    backdropFilter: 'blur(8px)'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: 'white',
    lineHeight: '1.3'
  },
  subtitle: {
    margin: '0 0 16px 0',
    color: '#9CA3AF',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export const buttonStyles = {
  primary: {
    padding: '10px 16px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '8px',
    color: '#60a5fa',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  success: {
    padding: '10px 16px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    color: '#34d399',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  danger: {
    padding: '10px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  }
};

export const ratingStyles = {
  container: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: '8px',
    border: '1px solid rgba(75, 85, 99, 0.3)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  star: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  }
};

export const notesStyles = {
  container: {
    marginBottom: '20px'
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#9CA3AF',
    fontWeight: '600'
  },
  content: {
    padding: '12px',
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#D1D5DB'
  }
}; 
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

const formatLastLogin = (lastLogin: string | null | undefined): string => {
  if (!lastLogin) {
    return 'Never';
  }

  try {
    const loginDate = new Date(lastLogin);
    
    // Check if date is valid
    if (isNaN(loginDate.getTime())) {
      return 'Never';
    }

    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    
    if (diffMs < 0) {
      return 'Never';
    }

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    // Return based on the largest applicable unit
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (seconds > 0) {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    return 'Never';
  }
};

export { formatDate, formatLastLogin };
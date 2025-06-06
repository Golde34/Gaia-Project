export const convertTimestampToDate = (timestamp) => {
    // return new Date(timestamp).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    return new Date(timestamp).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
};

export const formatHourNumber = (value) => {
    if (value < 0) {
        return true;
    }
    if (value > 24) {
        return true;
    }
    return false;
}

export const convertDateToString = (date) => {
    // Format date to string dd/MM/yyyy HH:mm:ss
    return date.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export const convertISODateToString = (isoDate) => {

    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, nên cần +1
    const day = date.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

export const calculateDuration = (start, end) => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;

  if (endTotal <= startTotal) {
    endTotal += 24 * 60;
  }

  const diffMinutes = endTotal - startTotal;
  const duration = Math.floor((diffMinutes * 2) / 60) / 2;

  return duration;
};

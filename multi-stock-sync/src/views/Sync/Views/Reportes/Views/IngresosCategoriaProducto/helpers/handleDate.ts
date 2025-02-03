
export const handleDateInit = (date: Date = new Date) => {
  const year = date.getFullYear();
  const lastMonth = (date.getMonth() < 10) ? `0${date.getMonth()}` : date.getMonth();
  
  if(date.getMonth() + 1 === 1) {
    const lastMonth = (date.getMonth() < 10) ? `0${date.getMonth() + 12}` : date.getMonth() + 12;
    return `${year - 1}-${lastMonth}-01`;
  }
  
  return `${year}-${lastMonth}-01`;
};

export const handleDateEnd = (date: Date = new Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() < 10) ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate();

  return `${year}-${month}-${day}`;
};
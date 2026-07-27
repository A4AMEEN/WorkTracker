const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toDateOnly = (value = new Date()) => {
  const d = new Date(value);
  return d.toISOString().split("T")[0];
};

const getDayName = (dateString) => {
  const d = new Date(`${dateString}T00:00:00`);
  return DAYS[d.getDay()];
};

const pad = (n) => String(n).padStart(2, "0");

const getWeekNumber = (dateString) => {
  const d = new Date(`${dateString}T00:00:00`);
  const temp = new Date(d.valueOf());
  const dayNum = (d.getDay() + 6) % 7;
  temp.setDate(temp.getDate() - dayNum + 3);
  const firstThursday = temp.valueOf();
  temp.setMonth(0, 1);
  if (temp.getDay() !== 4) {
    temp.setMonth(0, 1 + ((4 - temp.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - temp.valueOf()) / 604800000);
};

const getWeekRange = (dateString) => {
  const d = new Date(`${dateString}T00:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
  const end = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;
  const weekNumber = getWeekNumber(dateString);
  const year = monday.getFullYear();

  const startLabel = `${MONTHS[monday.getMonth()].substring(0, 3)} ${monday.getDate()}`;
  const endLabel = `${MONTHS[sunday.getMonth()].substring(0, 3)} ${sunday.getDate()}, ${sunday.getFullYear()}`;

  return {
    weekNumber,
    year,
    start,
    end,
    label: `Week ${weekNumber} (${startLabel} - ${endLabel})`,
  };
};

const getMonthLabel = (dateString) => {
  const parts = dateString.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  return `${MONTHS[month]} ${year}`;
};

const getMonthRange = (dateString) => {
  const parts = dateString.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const start = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${pad(month)}-${pad(lastDay)}`;
  return { start, end, label: getMonthLabel(dateString) };
};

module.exports = {
  toDateOnly,
  getDayName,
  getWeekNumber,
  getWeekRange,
  getMonthLabel,
  getMonthRange,
};

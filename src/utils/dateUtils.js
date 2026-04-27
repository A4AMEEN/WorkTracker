const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const toDateOnly = (value = new Date()) => {
  const d = new Date(value);
  return d.toISOString().split("T")[0];
};

const getDayName = (dateString) => {
  const d = new Date(`${dateString}T00:00:00`);
  return DAYS[d.getDay()];
};

module.exports = {
  toDateOnly,
  getDayName
};

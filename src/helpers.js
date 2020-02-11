function declOfNum(number, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function removeBreaks(string) {
  return string.replace(/(\r\n|\n|\r)/gm, " ").replace(/  +/gm, " ");
}

function titleCase(string) {
  return string.trim()[0].toUpperCase() + string.slice(1);
}

function hideButton(ctx) {
  return ctx.session.user.role !== "Admin";
}

module.exports = {
  declOfNum,
  removeBreaks,
  titleCase,
  hideButton
};

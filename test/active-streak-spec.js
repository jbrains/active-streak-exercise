import { skip, test } from "zora";
import { DateTime } from "luxon";

const formatDurationInDays = (n) => `${n} day${n === 1 ? "" : "s"}`;

const formatActiveStreak = (asOfDateAsText) => (measurements) =>
  formatDurationInDays(
    activeStreak(DateTime.fromISO(asOfDateAsText).startOf("day"))(
      measurements.map((m) => DateTime.fromISO(m.date).startOf("day"))
    )
  );

const startDateOfStreak = (asOfDate, mostRecentDate) => {
  let yesterday = asOfDate.minus({ days: 1 });
  return mostRecentDate.equals(asOfDate)
    ? asOfDate
    : mostRecentDate.equals(yesterday)
    ? yesterday
    : undefined;
};

const activeStreak = (asOfDate) => (datesSortedByMostRecent) => {
  if (datesSortedByMostRecent.length === 0) {
    return 0;
  }

  let startDate = startDateOfStreak(asOfDate, datesSortedByMostRecent[0]);
  return startDate === undefined ? 0 : go(startDate, datesSortedByMostRecent);
};

const go = (asOfDate, datesSortedByMostRecent) =>
  datesSortedByMostRecent.length === 0
    ? 0
    : asOfDate.equals(datesSortedByMostRecent[0])
    ? 1 + go(asOfDate.minus({ days: 1 }), datesSortedByMostRecent.slice(1))
    : 0;

// ===== Test Helpers =====
const date = (iso8601Text) => DateTime.fromISO(iso8601Text).startOf("day");

test("luxon", (t) => {
  t.notOk(
    date("2022-02-01") === date("2022-02-01"),
    "Same ISO Date strings are not equal with ==="
  );
  t.notOk(
    date("2022-02-01") == date("2022-02-01"),
    "Same ISO Date strings are not equal with =="
  );
  t.ok(
    date("2022-02-01").equals(date("2022-02-01")),
    "Same ISO Date strings are equal with equals()"
  );
  t.equal(
    date("2022-02-01"),
    date("2022-02-01"),
    "Same ISO Date strings are equal with equals()"
  );
  t.ok(date("2022-01-30") < date("2022-01-31"));
});

test("start date of streak", (t) => {
  t.equal(
    startDateOfStreak(date("2022-02-01"), date("2022-02-01")),
    date("2022-02-01"),
    "Start date of streak, when we match today"
  );
  t.equal(
    startDateOfStreak(date("2022-02-01"), date("2022-01-31")),
    date("2022-01-31"),
    "Start date of streak, when we match yesterday"
  );
  t.equal(
    startDateOfStreak(date("2022-02-01"), date("2022-01-30")),
    undefined,
    "Start date of streak, when it doesn't match"
  );
});

test("active streak", (t) => {
  const activeStreakFromDatesAsText = (datesAsText) =>
    activeStreak(date("2022-02-01"))(datesAsText.map((each) => date(each)));

  t.equal(activeStreakFromDatesAsText([]), 0, "no dates, no streak");

  test("active streak, 1 date", (t) => {
    t.equal(
      activeStreakFromDatesAsText(["2022-02-01"]),
      1,
      "streak from today"
    );
    t.equal(
      activeStreakFromDatesAsText(["2022-01-31"]),
      1,
      "streak from yesterday"
    );
    t.equal(
      activeStreakFromDatesAsText(["2022-01-30"]),
      0,
      "no streak: date too early"
    );
  });

  test("active streak, 2 dates", (t) => {
    t.equal(
      activeStreakFromDatesAsText(["2022-02-01", "2022-01-31"]),
      2,
      "active streak of 2 days from today"
    );
    t.equal(
      activeStreakFromDatesAsText(["2022-01-31", "2022-01-30"]),
      2,
      "active streak of 2 days from yesterday"
    );
    t.equal(
      activeStreakFromDatesAsText(["2022-02-01", "2022-01-30"]),
      1,
      "active streak of 1 day, because we skipped a day"
    );
    t.equal(
      activeStreakFromDatesAsText(["2022-01-31", "2022-01-29"]),
      1,
      "active streak of 1 day from yesterday, because we skipped a day"
    );
    t.equal(
      activeStreakFromDatesAsText(["2022-01-30", "2022-01-29"]),
      0,
      "would-be streak of 2 days, but it starts before yesterday"
    );
  });

  test("active streak, longer", (t) => {
    t.equal(
      activeStreakFromDatesAsText([
        "2022-01-30",
        "2022-01-29",
        "2022-01-28",
        "2022-01-27",
        "2022-01-26",
      ]),
      0,
      "would-be streak of 5 days, but it starts before yesterday"
    );
    t.equal(
      activeStreakFromDatesAsText([
        "2022-01-31",
        "2022-01-30",
        "2022-01-29",
        "2022-01-28",
        "2022-01-27",
      ]),
      5,
      "streak of 5 days, starting yesterday"
    );
    t.equal(
      activeStreakFromDatesAsText([
        "2022-02-01",
        "2022-01-31",
        "2022-01-30",
        "2022-01-29",
        "2022-01-28",
      ]),
      5,
      "streak of 5 days, starting today"
    );
    t.equal(
      activeStreakFromDatesAsText([
        "2022-02-01",
        "2022-01-31",
        "2022-01-30",
        "2022-01-24",
        "2022-01-23",
      ]),
      3,
      "streak of 3 days, starting today, before a missed day"
    );
  });
});

skip("quarantined tests for end to end", (t) => {
  t.equal(formatActiveStreak("2022-02-01")([]), "0 days");
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-02-01" }]), "1 day");
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-01-31" }]), "1 day");
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-01-30" }]), "0 days");
});

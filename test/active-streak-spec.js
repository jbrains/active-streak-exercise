import { test } from "zora";
import { DateTime } from "luxon";

const formatActiveStreak = (measurements) =>
  measurements.length === 0
    ? "0 days"
    : DateTime.fromISO(measurements[0].date) < "2022-01-31"
    ? "0 days"
    : "1 day";

test("end to end", (t) => {
  t.equal(formatActiveStreak([]), "0 days");
  t.equal(formatActiveStreak([{ date: "2022-02-01" }]), "1 day");
  t.equal(formatActiveStreak([{ date: "2022-01-31" }]), "1 day");
  t.equal(formatActiveStreak([{ date: "2022-01-30" }]), "0 days");
});

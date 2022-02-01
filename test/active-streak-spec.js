import { test } from "zora";

const activeStreak = (measurements) =>
  measurements.length > 0 ? "1 day" : "0 days";

test("end to end", (t) => {
  t.equal(activeStreak([]), "0 days");
  t.equal(activeStreak([{ date: "2022-02-01" }]), "1 day");
  t.equal(activeStreak([{ date: "2022-01-31" }]), "1 day");
});

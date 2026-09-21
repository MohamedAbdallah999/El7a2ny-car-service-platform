import assert from "node:assert/strict";
import test from "node:test";
import { businessHoursSchema } from "../src/modules/business/business.validation.js";

test("business hours accept editable open and closed days", () => {
  const result = businessHoursSchema.safeParse({
    hours: [
      {
        dayOfWeek: 6,
        isClosed: false,
        openingTime: "09:30",
        closingTime: "18:15",
      },
      { dayOfWeek: 5, isClosed: true },
    ],
  });

  assert.equal(result.success, true);
});

test("business hours reject duplicate days and invalid time ranges", () => {
  assert.equal(
    businessHoursSchema.safeParse({
      hours: [
        { dayOfWeek: 0, isClosed: true },
        { dayOfWeek: 0, isClosed: true },
      ],
    }).success,
    false,
  );

  assert.equal(
    businessHoursSchema.safeParse({
      hours: [
        {
          dayOfWeek: 1,
          isClosed: false,
          openingTime: "18:00",
          closingTime: "09:00",
        },
      ],
    }).success,
    false,
  );
});

import http from "k6/http";
import { check, sleep } from "k6";

// Options
export let options = {
  stages: [
    { duration: "1s", target: 20 },
    { duration: "1s", target: 0 },
    { duration: "10s", target: 20 },
    { duration: "20s", target: 20 },
    { duration: "7s", target: 5 },
    { duration: "1s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<350"], // 95% requests < 350ms
    iterations: ["count<500"],
  },
};

export default function () {
  let res = http.get("https://test.k6.io/contacts.php");

  // Assertions
  check(res, {
    "status is 200": (r) => r.status === 200,
    "transaction time OK": (r) => r.timings.duration < 500,
    "Page is Contact us": (r) => r.body.includes("Contact us"),
  });

  sleep(1);
}

import http from "k6/http";
import { Trend, Rate } from "k6/metrics";
import { check, group, sleep } from "k6";
import {
  describe,
  expect,
} from "https://jslib.k6.io/k6chaijs/4.3.4.3/index.js";

// Options
export let options = {
  stages: [
    { duration: "1s", target: 10 },
    { duration: "3s", target: 10 },
    { duration: "1s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<350"], // 95% requests < 350ms
    iterations: ["count<25"],
    Website_publicapis_https_support_rate: ["rate>0.9"],
    Website_K6_Contact_duration: ["p(95)<350"],
    Website_K6_News_duration: ["p(95)<350"],
    Website_publicapis_duration: ["p(95)<350"],
  },
};

const httpsSupportRate = new Rate("Website_publicapis_https_support_rate");
const k6_Contacts = new Trend("Website_K6_Contact_duration");
const k6_News = new Trend("Website_K6_News_duration");
const publicapis = new Trend("Website_publicapis_duration");

export default function () {
  group("Website test.k6.io", () => {
    group("Halaman Contact Us", () => {
      let res = http.get("https://test.k6.io/contacts.php", {
        tags: { detail: "Halaman Contacts" },
      });

      k6_Contacts.add(res.timings.duration);

      check(res, {
        "status is 200": (r) => r.status === 200,
        "transaction time OK": (r) => r.timings.duration < 400,
        "Page is Contact us": (r) => r.body.includes("Contact us"),
      });
    });

    group("Halaman News", () => {
      let res = http.get("https://test.k6.io/news.php", {
        tags: { detail: "Halaman News" },
      });

      k6_News.add(res.timings.duration);

      check(res, {
        "status is 200": (r) => r.status === 200,
        "transaction time OK": (r) => r.timings.duration < 400,
        "Page is News": (r) => r.body.includes("In the news"),
      });
    });
  });

  describe("Website api.publicapis.org", () => {
    const res = http.get("https://api.publicapis.org/random");

    httpsSupportRate.add(res.json().entries[0].HTTPS);

    publicapis.add(res.timings.duration);

    expect(res.status, "Status").to.equal(200);
    expect(res.json().entries[0].Auth, "Auth").to.be.oneOf(["apiKey", "OAuth"]);
  });

  sleep(1);
}

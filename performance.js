import http from "k6/http";
import { check, sleep, group } from "k6";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
const baseURL = "https://reqres.in";

export const options = {
  vus: 1000,
  iterations: 3500,
  thresholds: {
    http_req_duration: ["avg < 2000"], // Response API Max 2s
    http_req_failed: ["rate < 0.01"], // 1% error rate
  },
};

// Assertions
export function assertResponseCode(response, expectedStatusCode) {
  check(response, {
    [`Correct Status code is ${expectedStatusCode}`]: (res) => {
      const body = JSON.parse(res.body);
      return res.status === expectedStatusCode;
    },
  });
}

export function assertResponseBodyPOST(postRes, fieldName, expectedValue) {
  check(postRes, {
    [`Response body field '${fieldName}' same with '${expectedValue}'`]: (
      res
    ) => {
      const body = JSON.parse(res.body);
      return body[fieldName] === expectedValue;
    },
  });
}

export function assertResponseBodyPUT(putRes, fieldName, expectedValue) {
  check(putRes, {
    [`Response body field '${fieldName}' same with '${expectedValue}'`]: (
      res
    ) => {
      const body = JSON.parse(res.body);
      return body[fieldName] === expectedValue;
    },
  });
}

export default function(postRes, putRes) {
  group("postScenario", function () {
    // POST Request
    const postPathUrl = "/api/users";
    const postPayload = JSON.stringify({
      name: "morpheus",
      job: "leader",
    });

    const postParams = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const postRes = http.post(
      `${baseURL}${postPathUrl}`,
      postPayload,
      postParams
    );

    // Assertions
    assertResponseCode(postRes, 201);
    assertResponseBodyPOST(postRes, "name", "morpheus");
    assertResponseBodyPOST(postRes, "job", "leader");
  });
  sleep(2);
  group("putScenario", function () {
    // PUT Request
    const putPathUrl = "/api/users/2";
    const putPayload = JSON.stringify({
      name: "morpheus",
      job: "zion resident",
    });

    const putParams = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const putRes = http.put(`${baseURL}${putPathUrl}`, putPayload, putParams);

    // Assertions
    assertResponseCode(putRes, 200);
    assertResponseBodyPUT(putRes, "name", "morpheus");
    assertResponseBodyPUT(putRes, "job", "zion resident");
  });
}
export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
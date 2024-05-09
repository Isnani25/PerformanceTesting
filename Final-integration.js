import http from "k6/http";
import { group } from "k6";
import { check } from "k6";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const baseURL = 'https://reqres.in';
const defaultHeaders = { 'Content-Type': 'application/json' };

export const options = {
    scenarios: {
        post: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            exec: 'postScenario',
        },
        put: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            exec: 'putScenario',
        },
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

export function assertResponseHeader(response, expectedHeaders) {
    check(response, {
        'Headers Match Expected Values': (r) => {
            for (const [key, value] of Object.entries(expectedHeaders)) {
                if (key.toLowerCase() === 'content-type' && r.headers[key].toLowerCase().startsWith(value.toLowerCase())) {
                    continue; // Ignore charset in Content-Type header
                }
                if (r.headers[key] !== value) {
                    console.error(`Expected header '${key}: ${value}', but found '${key}: ${r.headers[key]}'`);
                    return false;
                }
            }
            return true;
        },
    });
}


export function assertResponseBodyPOST(postRes, fieldName, expectedValue) {
    check(postRes, {
        [`Response body field '${fieldName}' same with '${expectedValue}'`]: (res) => {
            const body = JSON.parse(res.body);
            return body[fieldName] === expectedValue;
        },
    });
}

export function assertResponseBodyPUT(putRes, fieldName, expectedValue) {
    check(putRes, {
        [`Response body field '${fieldName}' same with '${expectedValue}'`]: (res) => {
            const body = JSON.parse(res.body);
            return body[fieldName] === expectedValue;
        },
    });
}

// Scenario POST Request
export function postScenario() {
    const postPathUrl = '/api/users';
    const postPayload = JSON.stringify({
        "name": "morpheus",
        "job": "leader",
    });

    const postResponse = http.post(`${baseURL}${postPathUrl}`, postPayload, { headers: defaultHeaders });

    // Assertions
    assertResponseHeader(postResponse, defaultHeaders);
    assertResponseCode(postResponse, 201);
    assertResponseBodyPOST(postResponse, 'name', 'morpheus');
    assertResponseBodyPOST(postResponse, 'job', 'leader');
}

// Scenario PUT Request
export function putScenario() {
    const puthPathUrl = '/api/users/2';
    const putPayload = JSON.stringify({
        "name": "morpheus",
        "job": "zion resident",
    });

    const putResponse = http.put(`${baseURL}${puthPathUrl}`, putPayload, { headers: defaultHeaders });

    // Assertions
    assertResponseHeader(putResponse, defaultHeaders);
    assertResponseCode(putResponse, 200);
    assertResponseBodyPUT(putResponse, 'name', 'morpheus');
    assertResponseBodyPUT(putResponse, 'job', 'zion resident');
}
export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
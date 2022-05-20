const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 3002;

// https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
const serialize = (obj) => {
  const str = [];
  for (const p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

// [['cookie', 'x-foo']] -> [["cookie", "x-foo"]]
const parseHeaders = (stringHeaders) => {
  try {
    return JSON.parse(stringHeaders);
  } catch {
    try {
      return JSON.parse(stringHeaders.replace(/'/g, '"'));
    } catch {
      return {};
    }
  }
};

// [["cookie", "x-foo"]] -> { cookie: "x-foo" }
const composeHeaders = (arrayOfHeaders) => {
  const headers = {};

  arrayOfHeaders.forEach((header) => {
    headers[header[0]] = header[1];
  });

  return headers;
};

// Parse string to its type
const composeQuery = (originalQuery) => {
  let query = originalQuery;

  if (originalQuery?.ignoreReqHeaders) {
    query.ignoreReqHeaders = originalQuery?.ignoreReqHeaders === "true";
  }

  if (originalQuery?.redirectWithProxy) {
    query.ignoreReqHeaders = originalQuery?.redirectWithProxy === "true";
  }

  if (originalQuery?.followRedirect) {
    query.followRedirect = originalQuery?.followRedirect === "true";
  }

  if (originalQuery?.appendReqHeaders) {
    const headers = parseHeaders(originalQuery.appendReqHeaders);

    query.appendReqHeaders = composeHeaders(headers);
  }

  if (originalQuery?.appendResHeaders) {
    const headers = parseHeaders(originalQuery.appendResHeaders);

    query.appendResHeaders = composeHeaders(headers);
  }

  if (originalQuery?.deleteReqHeaders) {
    const headers = parseHeaders(originalQuery.deleteReqHeaders);

    query.deleteReqHeaders = headers;
  }

  if (originalQuery?.deleteResHeaders) {
    const headers = parseHeaders(originalQuery.deleteResHeaders);

    query.deleteResHeaders = headers;
  }

  return query;
};

// https://bobbyhadz.com/blog/javascript-lowercase-object-keys
const toLowerKeys = (obj) =>
  Object.keys(obj).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = obj[key];
    return accumulator;
  }, {});

const concatHeaders = (...args) => {
  const totalHeaders = {};

  for (const headers of args) {
    Object.assign(totalHeaders, toLowerKeys(headers));
  }

  return totalHeaders;
};

app.get("/proxy", async (req, res) => {
  const query = composeQuery(req.query);

  const {
    url,
    ignoreReqHeaders = false,
    followRedirect = false,
    redirectWithProxy = false,
    appendReqHeaders = {},
    appendResHeaders = {},
    deleteReqHeaders = [],
    deleteResHeaders = [],
  } = query;

  const decodedUrl = decodeURIComponent(url);

  const host = new URL(decodedUrl).host;

  let headers = concatHeaders({ host, ...appendReqHeaders });

  if (!ignoreReqHeaders) {
    headers = { host, ...headers };
  }

  const filteredHeaders = Object.keys(headers).reduce((acc, key) => {
    if (!deleteReqHeaders.includes(key)) {
      acc[key] = headers[key];
    }
    return acc;
  }, {});

  const response = await axios.get(decodedUrl, {
    responseType: "stream",
    headers: filteredHeaders,
    validateStatus: () => true,
    maxRedirects: followRedirect ? 0 : 5,
  });

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };

  const resHeaders = concatHeaders(
    response.headers,
    corsHeaders,
    appendResHeaders
  );

  for (let header in resHeaders) {
    if (deleteResHeaders.includes(header.toLowerCase())) continue;

    if (header.toLowerCase() === "location") {
      const encodedUrl = encodeURIComponent(resHeaders[header]);
      const redirectUrl = redirectWithProxy
        ? `/proxy?url=${encodedUrl}&${serialize(query)}`
        : encodedUrl;

      res.redirect(response.status, redirectUrl);

      return;
    }

    res.setHeader(header, resHeaders[header]);
  }

  res.status(response.status);

  response.data.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

# requests-proxy

requests-proxy is a NodeJS proxy server that adds request/response headers to the proxied request.

It allow you to append/remove request and response headers as you want to.

## How to use?

Just send a request to `https://yourproxydomain.com/proxy` and the following supported queries:

- `url` (_Required_) - Proxy target.\
  _Note_: URL must be encoded to work correctly
- `ignoreReqHeaders` - If set, the request headers sent from browser will be ignore.\
  Example: `ignoreReqHeaders=true`
- `followRedirect` - Follow redirect if true, otherwise send raw redirect response.\
  Example: `followRedirect=true`
- `redirectWithProxy` - If set, the server will add proxy to the redirect location.\
  Example: `redirectWithProxy=true`
- `decompress` - If set, no decompress would be done. return back the non-compressed response.\
  Example: `decompress=true`
- `appendReqHeaders` - If set, these headers will be appended to the request headers.\
  _Note_: It will override the header if it exists.\
  Example: `appendReqHeaders=[["referer": "https://google.com"], ["origin": "https://google.com"]]`
- `appendResHeaders` - If set, these headers will be appended to the response headers.\
  Example: `appendResHeaders=[["content-type": "text/plain"]]`
- `deleteReqHeaders` - If set, these headers will be removed from the request headers.\
  Example: `deleteReqHeaders=["origin"]`
- `deleteResHeaders` - If set, these headers will be removed from the response headers.\
  Example: `deleteResHeaders=["set-cookie"]`

_CORS applied to `*` by default, you can override it with `appendReqHeaders`_

## Install

```sh
git clone https://github.com/hoangvu12/requests-proxy
cd requests-proxy
npm install
npm start
```

## Example

- `http://yourproxydomain.com/proxy?url=http%3A%2F%2Fgoogle.com` - Google.com with CORS headers
- `http://yourproxydomain.com/proxy?url=http%3A%2F%2Fgoogle.com&appendResHeaders=[["content-type": "text/plain"]]` - Request Google.com as text

- `http://yourproxydomain.com/proxy?url=http%3A%2F%2Fgoogle.com&deleteResHeaders=["set-cookie"]` - Remove Google.com cookies

## Similiars

- [CORS bridged](https://cors.bridged.cc)
- [cors-anywhere](https://github.com/Rob--W/cors-anywhere)
- [Whatever Origin](https://github.com/ripper234/Whatever-Origin)
- [Go Between](https://github.com/okfn/gobetween)
- [goxcors](https://github.com/acidsound/goxcors)
- [YaCDN](https://yacdn.org)
- [All Origins](https://allorigins.win)
- [Cloudflare Cors Anywhere](https://github.com/Zibri/cloudflare-cors-anywhere)
- [JSONProxy](https://jsonp.afeld.me)

## Thank you

[@jimmywarting](https://github.com/jimmywarting) - A great [gist](https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347) about CORS Proxies

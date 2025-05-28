# Expand Short URLs

This library is designed to expand short URLs. This does not have any external dependencies and is lightweight.

## Installation

```sh
npm install expand-short-urls
```

## Usage

```typescript
import { expand } from 'expand-short-url';

const shortURL = 'https://bit.ly/3xYz1a2';

const expandedURL = await expand(shortURL);
console.log(expandedURL);
```

## Options

You can pass options to the `expand` function to customize its behavior. Also, you can pass any options supported by http.request or https.request module.

1. `timeout`: The maximum time to wait for the expansion to complete (default: 5000 ms).
2. `maxRedirects`: The maximum number of redirects to follow (default: 3).

## Example

```typescript
import { expand } from 'expand-short-url';
const shortURL = 'https://bit.ly/3xYz1a2';
const expandedURL = await expand(shortURL, { timeout: 10000, maxRedirects: 5 });
console.log(expandedURL);
```

## Output

```javascript
'https://example.com/'
```


If you like my work, please consider giving it a star on [GitHub](http://github.com/gagan-bhullar-tech/extract-hrefs) or
Sponsor my work by following [sponsoring me](https://github.com/sponsors/gagan-bhullar-tech) link.
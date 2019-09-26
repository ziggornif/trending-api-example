# trending-api-example

A simple Github trending API created from web scraping

## Install

```sh
npm i
```

## Run

```
npm start
```

## Example

http://localhost:3000/api/trending/javascript?since=weekly

```json
{
  "since": "weekly",
  "count": 25,
  "projects": [
    {
    "project": "foo/bar",
    "description": "awesome description",
    "url": "https://github.com/foo/bar"
    },
    {
    "project": "foo/baz",
    "description": "awesome description",
    "url": "https://github.com/foo/baz"
    },
    ...
  ]
}
```
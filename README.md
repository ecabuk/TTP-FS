## Demo

https://ttp-fs.herokuapp.com

---

## Requirements

- Python 3
- NodeJS 8 or higher

## Install

Setup python
```bash
python3 -m venv venv && \
source venv/bin/activate && \
pip install -r requirements.txt
```

Setup JS
```bash
npm install
```

Start JS Development Environment
```bash
gulp dev
```

Start Django dev server
```bash
python3 app/manage.py runserver
```


## API

Api Base: `/api/v1/market`

### `GET /symbols`

Returns all available symbols.

### `GET /search/<term>`

Searches given term on symbol and stock names. Returns matched results.

### `GET /transactions`

Returns the requester user's transactions.

Arguments:

- `per_page` 
  - Default: `10`
- `page`
  - Default: `1`
- `order_by`
  - Options: `total`, `qty`, `date`
  - Default: `date`
- `order`
  - Options: `asc`, `desc`
  - Default: `desc`
- `start` Start date.
  - Format: `YYYY-mm-dd`
- `end` End date.
  - Format: `YYYY-mm-dd`
- `total_max` Transaction total max value.
- `total_min` Transaction total min value.

### `POST /action`

Arguments:

- `type`
  - Options: `buy`


Arguments for `type:buy`:

- `symbol` Stock symbol to buy.
- `qty` Quantity.


import os
import requests
import json
from babel.numbers import format_decimal
from datetime import date, datetime, timedelta
from dateutil.parser import parse
from dotenv import load_dotenv

load_dotenv()

PRICES_API = os.getenv('PRICES_API')

if PRICES_API is None or PRICES_API == '':
    raise Exception('Please provide the PRICES_API environment variable')


class Price:
    def __init__(self, price: float, dt: date):
        self.value = price
        self.value_euro = format_euro(price)
        self.datetime = dt
        self.hour = dt.strftime('%H')
        self.formatted = f'{self.value_euro}@{self.hour}:00'


def get_prices(start: date, end: date) -> list[Price]:
    start_day = start.strftime('%Y-%m-%d')
    end_day = end.strftime('%Y-%m-%d')
    response = requests.get(
        f'{PRICES_API}?start={start_day}&end={end_day}')
    content = response.content.decode('utf-8')
    price_data = json.loads(content)

    return [Price(x.get('price'), parse(x.get('dateTime'))) for x in price_data]


def get_current_price(prices: list[Price]) -> Price:
    now = datetime.now()
    hour = now.strftime('%H')
    return next((x for x in prices if x.datetime.strftime('%H') == hour), None)


def get_tomorrow():
    today = date.today()
    tomorrow = today + timedelta(days=1)
    return get_prices(tomorrow, tomorrow)


def get_today():
    today = date.today()
    return get_prices(today, today)


def get_date_days_ago(days: int):
    ago = date.today() - timedelta(days=days)
    return get_prices(ago, ago)


def get_min_price(prices: list[Price]):
    return min(prices, key=lambda x: x.value)


def get_max_price(prices: list[Price]):
    return max(prices, key=lambda x: x.value)


def get_cheapest_period(prices: list[Price], n: int):

    prices_sorted = sorted(prices, key=lambda x: x.hour)
    min_sum = float('inf')
    min_window = None

    for i in range(len(prices_sorted) - n + 1):
        window_sum = sum(x.value for x in prices_sorted[i:i+n])
        if window_sum < min_sum:
            min_sum = window_sum
            min_window = prices_sorted[i:i+n]

    return min_window


def get_cheap_period_recent_average(days: int) -> float:
    today = date.today()

    total = float(0)
    for i in range(days):
        day = today - timedelta(days=i)
        prices = get_prices(day, day)
        if prices:
            cheapest_period = get_cheapest_period(prices, 3)
            if cheapest_period:
                total += calculate_average(cheapest_period)

    return total / days


def calculate_average(prices: list[Price]) -> float:
    return sum(x.value for x in prices) / len(prices)


def format_euro(amount) -> str:
    return f'{format_decimal(amount, locale="en_GB", format="#,##0.000")}'

import streamlit as st
import requests
import pandas as pd
import json
from babel.numbers import format_decimal
from datetime import date, datetime, timedelta
from dateutil.parser import parse

st.set_page_config(layout="wide")


def format_euro(amount) -> str:
    return f'{format_decimal(amount, locale="en_GB", format="#,##0.000")}'


PRICES_API = 'https://elec.daithiapp.com/api/v1/price'


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


# get data
# price_data_v1=get_prices()
st.title('Electricity prices')

start_date_average = date.today() - timedelta(days=30)
elecAverage = round(calculate_average(
    get_prices(start_date_average, date.today())), 2)
currentPrice = round(get_current_price(get_today()).value, 2)
difElec = round(currentPrice - elecAverage, 2)
col1, col2, col3, col4 = st.columns(4)
col1.metric("Average Price (30 days)", elecAverage, delta_color="inverse")
col2.metric("Current Price", currentPrice, difElec, delta_color="inverse")
labelminhour = "Min Price at " + get_min_price(get_today()).hour + ":00"
labelmaxhour = "Max Price at " + get_max_price(get_today()).hour + ":00"

minToday = round(get_min_price(get_today()).value, 2)
difElecMin = round(minToday - elecAverage, 2)

maxToday = round(get_max_price(get_today()).value, 2)
difElecMax = round(maxToday - elecAverage, 2)

col3.metric(labelminhour, minToday, difElecMin, delta_color="inverse")
col4.metric(labelmaxhour, maxToday, difElecMax, delta_color="inverse")


if get_tomorrow():
    st.write('TOMORROW')
    labelminhourT = "Min Price at " + \
        get_min_price(get_tomorrow()).hour + ":00"
    labelmaxhourT = "Max Price at " + \
        get_max_price(get_tomorrow()).hour + ":00"

    col1, col2, col3 = st.columns(3)
    col2.metric(labelminhourT, round(get_min_price(
        get_tomorrow()).value, 2), delta_color="inverse")
    col3.metric(labelmaxhourT, round(get_max_price(
        get_tomorrow()).value, 2), delta_color="inverse")
else:
    st.subheader("Tomorrow's prices are not available yet")


st.header("Last 30 days evolutions")
# Plot timeline
ago_days = 30
i = 0
# initialize list for plot
date_arr = []
avg_arr = []

for x in range(ago_days, 0, -1):
    i = i+1
    date_average = date.today() - timedelta(x)
    date_average_str = str(date.today() - timedelta(x))
    average_str = str(round(calculate_average(get_date_days_ago(x)), 2))
    average = round(calculate_average(get_date_days_ago(x)), 2)
    date_arr.append(date_average_str)
    avg_arr.append(average)

df = pd.DataFrame({
    'date': date_arr,
    'Average electricity prices': avg_arr
})

df = df.rename(columns={'date': 'index'}).set_index('index')

# Create the pandas DataFrame

# dateList.append( {"id": str(i), "content": "100", "start": "100"})
# st.write(calculate_average(get_date_days_ago(x)))

chart = st.line_chart(df)
# timeline = st_timeline(dateList, groups=[], options={}, height="300px")


# start_day = '2023-03-01'
# end_day = '2023-04-01'
# response = requests.get(
#         f'{PRICES_API}?start={start_day}&end={end_day}')
# content = response.content.decode('utf-8')
# price_data = json.loads(content)
# #plot
# st.write(' ')
# progress_bar = st.sidebar.progress(0)
# chart= st.line_chart( price_data, x= "dateTime", y = "price")


# for x in price_data:
#     new_rows = [x.get('price'), x.get('dateTime')]
#     #status_text.text("%x%% Complete" % x)
#     chart.add_rows(new_rows)

#    # progress_bar.progress(x)
#     #last_rows = new_rows
#     time.sleep(0.000005)


# for i in range(1, 101):
#     new_rows = last_rows[-1, :] + np.random.randn(5, 1).cumsum(axis=0)
#     status_text.text("%i%% Complete" % i)
#     chart.add_rows(new_rows)
#     progress_bar.progress(i)
#     last_rows = new_rows
#     time.sleep(0.05)

# progress_bar.empty()

# Streamlit widgets automatically run the script from top to bottom. Since
# this button is not connected to any other logic, it just causes a plain
# rerun.
# st.button("Re-run")

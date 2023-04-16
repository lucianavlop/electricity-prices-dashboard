import streamlit as st
import pandas as pd
from datetime import date, timedelta
from services.PriceService import *

st.set_page_config(layout="wide")

# get data
# price_data_v1=get_prices()
st.title('Precios de la electricidad')

start_date_average = date.today() - timedelta(days=30)
elecAverage = round(calculate_average(
    get_prices(start_date_average, date.today())), 2)
currentPrice = round(get_current_price(get_today()).value, 2)
difElec = round(currentPrice - elecAverage, 2)
col1, col2, col3, col4 = st.columns(4)
col1.metric("Precio Promedio (30 días)", elecAverage, delta_color="inverse")
col2.metric("Precio actual", currentPrice, difElec, delta_color="inverse")
labelminhour = "Precio min a las " + get_min_price(get_today()).hour + ":00"
labelmaxhour = "Precio max a las " + get_max_price(get_today()).hour + ":00"

minToday = round(get_min_price(get_today()).value, 2)
difElecMin = round(minToday - elecAverage, 2)

maxToday = round(get_max_price(get_today()).value, 2)
difElecMax = round(maxToday - elecAverage, 2)

col3.metric(labelminhour, minToday, difElecMin, delta_color="inverse")
col4.metric(labelmaxhour, maxToday, difElecMax, delta_color="inverse")


if get_tomorrow():
    st.write('TOMORROW')
    labelminhourT = "Precio min a las " + \
        get_min_price(get_tomorrow()).hour + ":00"
    labelmaxhourT = "Precio max a las " + \
        get_max_price(get_tomorrow()).hour + ":00"

    col1, col2, col3 = st.columns(3)
    col2.metric(labelminhourT, round(get_min_price(
        get_tomorrow()).value, 2), delta_color="inverse")
    col3.metric(labelmaxhourT, round(get_max_price(
        get_tomorrow()).value, 2), delta_color="inverse")
else:
    st.subheader("Los precios de mañana aún no están disponibles.")


st.header("Últimos 30 días")
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
    'Precios medios de electricidad': avg_arr
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

import streamlit as st
import pandas as pd
from datetime import date, timedelta, datetime
from services.PriceService import *

st.set_page_config(layout="wide")

#hide made with streamlit bottom
hide_streamlit_style = """
            <style>
            footer {visibility: hidden;}
            </style>
            """
st.markdown(hide_streamlit_style, unsafe_allow_html=True) 

today=datetime.today()
tomorrow_date= today + timedelta(days=1)
start_date_average = today - timedelta(days=30)
hours_day = 24 -1
elecAverage = round(calculate_average(
    get_prices(start_date_average, today)), 2)

cheapest_period = get_cheapest_period(get_today(), 3)
cheapest_period_today_avg = calculate_average(cheapest_period)

cheapest_period_tom= get_cheapest_period(get_tomorrow(), 3)
cheapest_period_tom_avg = calculate_average(cheapest_period_tom)

todays_health=calculate_day_rating(cheapest_period_today_avg)
tomorrow_health=calculate_day_rating(cheapest_period_tom_avg)


# title
st.title('Precios de la electricidad')

st.subheader('Hoy ' + today.strftime('%d/%m') + ' es un día ' + todays_health)
   
#Todays prices
today_prices=get_today()



currentPrice = round(get_current_price(today_prices).value, 2)
difElec = round(currentPrice - elecAverage, 2)
col1, col2, col3, col4 = st.columns(4)
col1.metric("Precio Promedio (30 días)", elecAverage, delta_color="inverse")
col2.metric("Precio actual - " + datetime.now().strftime("%H:%M"), currentPrice, difElec, delta_color="inverse")
labelminhour = "Precio min - " + get_min_price(get_today()).hour + ":00"
labelmaxhour = "Precio max - " + get_max_price(get_today()).hour + ":00"

minToday = round(get_min_price(today_prices).value, 2)
difElecMin = round(minToday - elecAverage, 2)

maxToday = round(get_max_price(today_prices).value, 2)
difElecMax = round(maxToday - elecAverage, 2)

col3.metric(labelminhour, minToday, difElecMin, delta_color="inverse")
col4.metric(labelmaxhour, maxToday, difElecMax, delta_color="inverse")


# Plot timeline today
i = 0
# initialize list for plot
date_arr = []
avg_arr = []

for x in range(0, hours_day):
    i = i+1
    #Gets data from the current hour until the hour less than the current. The plot orders the sequence later
    hour_str =  (datetime.now() + timedelta(hours=x)).strftime('%H')
    price_hour_str = get_price_hour(today_prices, hour_str).value
    date_arr.append(hour_str)
    avg_arr.append(price_hour_str)

plotToday = pd.DataFrame({
    'Date': date_arr,
    'Precios de la electricidad': avg_arr,
    'Media': elecAverage
})

plotToday = plotToday.rename(columns={'Date': 'index'}).set_index('index')


chart = st.line_chart(plotToday)#, line_width=3.0, color='blue')

#Tomorrow's prices
if get_tomorrow():
    st.subheader('Mañana ' + tomorrow_date.strftime('%d/%m') + ' es un día ' + tomorrow_health
             )
    labelminhourT = "Precio min - " + \
        get_min_price(get_tomorrow()).hour + ":00"
    labelmaxhourT = "Precio max - " + \
        get_max_price(get_tomorrow()).hour + ":00"

    col1, col2, col3, col4 = st.columns(4)
    col3.metric(labelminhourT, round(get_min_price(
        get_tomorrow()).value, 2), delta_color="inverse")
    col4.metric(labelmaxhourT, round(get_max_price(
        get_tomorrow()).value, 2), delta_color="inverse")
    

    # Plot timeline tomorrow
    i = 0
    # initialize list for plot
    date_arr = []
    avg_arr = []

    for x in range(0, hours_day):
        i = i+1
        #Gets data from the current hour until the hour less than the current. The plot orders the sequence later
        hour_str =  (datetime.now() + timedelta(hours=x)).strftime('%H')
        price_hour_str = get_price_hour(get_tomorrow(), hour_str).value
        date_arr.append(hour_str)
        avg_arr.append(price_hour_str)

    plotTomorrow = pd.DataFrame({
        'Date': date_arr,
        'Precios de la electricidad': avg_arr,
        'Media': elecAverage
    })

    plotTomorrow = plotTomorrow.rename(columns={'Date': 'index'}).set_index('index')

    chart = st.line_chart(plotTomorrow)

else:
    st.subheader("Los precios de mañana aún no están disponibles - approx. 20:30")




st.header("Últimos 30 días")
# Plot timeline
ago_days = 30
# initialize list for plot
date_arr = []
avg_arr = []

for x in range(ago_days, -1, -1):
    date_average_str = str(date.today() - timedelta(x))
    #average_str = str(round(calculate_average(get_date_days_ago(x)), 2))
    average = round(calculate_average(get_date_days_ago(x)), 2)
    date_arr.append(date_average_str)
    avg_arr.append(average)

df = pd.DataFrame({
    'Date': date_arr,
    'Precios medios de electricidad': avg_arr,
    'Media': elecAverage
})

df = df.rename(columns={'Date': 'index'}).set_index('index')

chart = st.line_chart(df)

# Streamlit widgets automatically run the script from top to bottom. Since
# this button is not connected to any other logic, it just causes a plain
# rerun.
# st.button("Re-run")

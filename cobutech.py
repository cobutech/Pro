import requests
import json
import time
import os
import random

ALPHA_VANTAGE_API_KEY = "7JEDS0H7XPSD92GH" 
SYMBOL = "XAU" 
CURRENCY = "USD"
API_URL = f'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={SYMBOL}&to_currency={CURRENCY}&apikey={ALPHA_VANTAGE_API_KEY}'
BASE_PRICE = 1900.00
current_simulated_price = BASE_PRICE 

def _simulate_price():
    global current_simulated_price
    fluctuation = (random.random() * 0.005 + 0.0005) * (random.choice([1, -1]))
    current_simulated_price += fluctuation
    if current_simulated_price > BASE_PRICE + 0.5 or current_simulated_price < BASE_PRICE - 0.5:
        current_simulated_price = BASE_PRICE + (random.random() * 1 - 0.5) 
    return round(current_simulated_price, 5)

def fetch_live_price():
    if ALPHA_VANTAGE_API_KEY == "7JEDS0H7XPSD92GH":
        pass 
    
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        data = response.json()
        rate_key = f"Realtime Currency Exchange Rate"
        
        if rate_key in data:
            price_string = data[rate_key]['5. Exchange Rate']
            live_price = float(price_string)
            return live_price
        else:
            return _simulate_price()
            
    except requests.exceptions.RequestException:
        return _simulate_price()
    except Exception:
        return _simulate_price()

let botIsRunning = false;
let currentPrice = 1900.00; 
let currentCandle = {
    open: 1900.00,
    high: 1900.00,
    low: 1900.00,
    close: 1900.00
};
let lastCandleClose = 1900.00;
let candleCount = 0;

const CANDLE_INTERVAL_MS = 5000;
const PRICE_UPDATE_INTERVAL_MS = 500;
const CHART_HEIGHT = 600;
const BASE_PRICE = 1900.00; 
const PRICE_RANGE = 0.04; 
const CANDLE_WIDTH = 5;
const TOTAL_CANDLES_DISPLAY = 2000;

function updateTime() {
    const now = new Date();
    
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
    });

    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
        timeDisplay.textContent = timeString;
    }
}

function updateSpeed(speedValue) {
    const speedDisplay = document.getElementById('speed-display');
    if (speedDisplay) {
        speedDisplay.textContent = (PRICE_UPDATE_INTERVAL_MS / 1000).toFixed(2) + 's';
    }
}

function setBotStatus(isOn) {
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
        statusDisplay.classList.remove('status-on', 'status-off');
        
        if (isOn) {
            statusDisplay.classList.add('status-on');
        } else {
            statusDisplay.classList.add('status-off');
        }
    }
}

function toggleBot() {
    const button = document.getElementById('control-button');
    if (!!button) {
        botIsRunning = !botIsRunning; 
        
        setBotStatus(botIsRunning);
        
        if (botIsRunning) {
            button.textContent = 'STOP BOT';
            button.classList.remove('off');
            button.classList.add('on');
            
        } else {
            button.textContent = 'START BOT';
            button.classList.remove('on');
            button.classList.add('off');
        }
    }
}

function updatePriceDisplay() {
    const priceDisplay = document.getElementById('current-price-display');
    if (priceDisplay) {
        const formattedPrice = currentPrice.toFixed(2);
        priceDisplay.textContent = `CURENT PRICE: $${formattedPrice}`;
    }
    
    // Update the live price line position based on the new price
    const priceLine = document.getElementById('current-price-line');
    const priceMin = BASE_PRICE - PRICE_RANGE;
    const priceMax = BASE_PRICE + PRICE_RANGE;

    const mapPriceToPixels = (price) => {
        const normalizedPrice = (price - priceMin) / (priceMax - priceMin);
        return CHART_HEIGHT * (1 - normalizedPrice);
    };

    if (priceLine) {
        priceLine.style.top = `${mapPriceToPixels(currentPrice)}px`;
    }
}

async function fetchAndUpdatePrice() {
    try {
        const response = await fetch('/api/price', {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === "success" && data.price !== undefined) {
            currentPrice = data.price;
            updatePriceDisplay();
            // Crucial: Update the current candle with the newly fetched price
            updateCandle(currentPrice);
        } 
        
    } catch (error) {
        const priceDisplay = document.getElementById('current-price-display');
        if (priceDisplay) {
            priceDisplay.textContent = `CURENT PRICE: $ERROR`;
        }
    }
}


function generatePriceAxis() {
    const axisContainer = document.getElementById('price-axis');
    if (!axisContainer) return;

    axisContainer.innerHTML = '';
    
    const priceUnit = 0.005;
    const pricePoints = 20;

    for (let i = -pricePoints; i <= pricePoints; i++) {
        const price = BASE_PRICE + i * priceUnit;
        const priceMarker = document.createElement('div');
        priceMarker.className = 'price-marker';
        priceMarker.textContent = price.toFixed(2);

        const priceDiff = price - BASE_PRICE;
        const normalizedDiff = priceDiff / PRICE_RANGE;
        const topPosition = CHART_HEIGHT / 2 * (1 - normalizedDiff);
        
        priceMarker.style.top = `${topPosition}px`;
        axisContainer.appendChild(priceMarker);
    }
}

function updateCandle(newPrice) {
    if (newPrice > currentCandle.high) currentCandle.high = newPrice;
    if (newPrice < currentCandle.low) currentCandle.low = newPrice;
    currentCandle.close = newPrice;
    
    const chartContainer = document.getElementById('live-chart-container');
    if (!chartContainer.lastElementChild) return; 

    const lastCandleElement = chartContainer.lastElementChild;
    const bodyElement = lastCandleElement.querySelector('.candle-body');
    const wickElement = lastCandleElement.querySelector('.candle-wick');
    
    const priceMin = BASE_PRICE - PRICE_RANGE;
    const priceMax = BASE_PRICE + PRICE_RANGE;

    const mapPriceToPixels = (price) => {
        const normalizedPrice = (price - priceMin) / (priceMax - priceMin);
        return CHART_HEIGHT * (1 - normalizedPrice);
    };

    const topWick = mapPriceToPixels(currentCandle.high);
    const bottomWick = mapPriceToPixels(currentCandle.low);
    const topBody = mapPriceToPixels(Math.max(currentCandle.open, currentCandle.close));
    const bottomBody = mapPriceToPixels(Math.min(currentCandle.open, currentCandle.close));
    
    const bodyHeight = Math.abs(topBody - bottomBody) || 1; 

    wickElement.style.top = `${topWick}px`;
    wickElement.style.height = `${bottomWick - topWick}px`;

    bodyElement.style.top = `${topBody}px`;
    bodyElement.style.height = `${bodyHeight}px`;

    if (currentCandle.close > currentCandle.open) {
        lastCandleElement.classList.remove('bearish');
        lastCandleElement.classList.add('bullish');
    } else {
        lastCandleElement.classList.remove('bullish');
        lastCandleElement.classList.add('bearish');
    }
}

function addNewCandle() {
    lastCandleClose = currentCandle.close;
    currentCandle = {
        open: lastCandleClose,
        high: lastCandleClose,
        low: lastCandleClose,
        close: lastCandleClose,
    };
    
    const chartContainer = document.getElementById('live-chart-container');
    const candle = document.createElement('div');
    candle.className = `candle bullish`; 

    const wick = document.createElement('div');
    wick.className = 'candle-wick';
    
    const body = document.createElement('div');
    body.className = 'candle-body';
    
    candle.appendChild(wick);
    candle.appendChild(body);
    chartContainer.appendChild(candle);
    
    if (candleCount % 12 === 0) { 
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        marker.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        marker.style.left = `${(candleCount % TOTAL_CANDLES_DISPLAY) * CANDLE_WIDTH}px`;
        chartContainer.appendChild(marker);
    }
    
    candleCount++;

    const chartSection = document.querySelector('.chart-section');
    if (chartSection) {
        chartSection.scrollLeft = chartSection.scrollWidth;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);

    setBotStatus(botIsRunning);
    updateSpeed(PRICE_UPDATE_INTERVAL_MS / 1000); 

    const controlButton = document.getElementById('control-button');
    if (controlButton) {
        controlButton.addEventListener('click', toggleBot);
    }
    generatePriceAxis();
    addNewCandle();
    fetchAndUpdatePrice(); 
    setInterval(fetchAndUpdatePrice, PRICE_UPDATE_INTERVAL_MS);
    setInterval(addNewCandle, CANDLE_INTERVAL_MS);
});

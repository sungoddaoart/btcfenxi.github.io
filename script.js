// 获取K线数据的函数
async function getKlineData(symbol, interval) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=5`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Kline data:', error);
    }
}

// 显示K线数据的函数
function displayKlineData(interval, data) {
    const klineElement = document.getElementById(`kline-${interval}`);
    if (data && data.length > 0) {
        let klineDisplay = `<strong>Last 5 Kline:</strong><br>`;
        for (let i = 0; i < data.length; i++) {
            const kline = data[i];
            const time = new Date(kline[0]).toLocaleTimeString();
            const open = kline[1];
            const high = kline[2];
            const low = kline[3];
            const close = kline[4];
            const volume = kline[5];
            klineDisplay += `Time: ${time}, Open: ${open}, High: ${high}, Low: ${low}, Close: ${close}, Volume: ${volume}<br>`;
        }
        klineElement.innerHTML = klineDisplay;
    } else {
        klineElement.innerHTML = "No Kline data available.";
    }
}

// 获取实时代币价格的函数
async function getTokenPrice(symbol) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        const data = await response.json();
        return data.price;
    } catch (error) {
        console.error('Error fetching token price:', error);
    }
}

// 显示实时代币价格的函数
async function updateTokenPrice() {
    const tokenInput = document.getElementById('token-input').value;
    if (!tokenInput) {
        return;
    }

    const price = await getTokenPrice(tokenInput.toUpperCase());
    const priceDisplay = document.getElementById('token-price');

    if (price) {
        priceDisplay.innerText = `Price: $${price}`;
    } else {
        priceDisplay.innerText = 'Price: N/A';
    }
}

// 监听搜索按钮点击事件
document.getElementById('search-btn').addEventListener('click', updateTokenPrice);

// 定时更新价格
setInterval(updateTokenPrice, 30000); // 每30秒更新一次

// 监控代币的K线数据
async function monitorKlines() {
    const symbol = 'BTCUSDT'; // 使用你想要监控的交易对
    const intervals = ['1m', '5m', '15m', '1h', '4h']; // 不同的K线时间间隔

    for (let interval of intervals) {
        const klineData = await getKlineData(symbol, interval);
        displayKlineData(interval, klineData);
    }
}

// 定时更新K线数据
setInterval(monitorKlines, 60000); // 每分钟更新一次

// 判断K线下跌超过1%
function checkForDrop(previousClose, currentClose, threshold = 0.01) {
    const drop = (previousClose - currentClose) / previousClose;
    return drop >= threshold;
}

// 显示预警
function showAlert(elementId, message) {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerText = message;
    alertDiv.style.display = 'block'; // 显示红色预警
}

// 监控代币的K线数据并检查快速下跌
async function monitorToken(symbol, interval, alertElementId) {
    const data = await getKlineData(symbol, interval);
    if (!data || data.length < 2) {
        console.error('Invalid Kline data');
        return;
    }
    const previousKline = data[0];
    const currentKline = data[1];

    const previousClose = parseFloat(previousKline[4]);
    const currentClose = parseFloat(currentKline[4]);

    if (checkForDrop(previousClose, currentClose)) {
        const message = `${symbol} dropped sharply on ${interval} Kline!`;
        console.log('[ALERT]', message);
        showAlert(alertElementId, message); // 显示预警
    }
}

// 监控代币的多个K线周期
function monitorAllTokens() {
    monitorToken('BTCUSDT', '1m', 'alert-1min'); // 1分钟K线
    monitorToken('BTCUSDT', '5m', 'alert-5min'); // 5分钟K线
    monitorToken('BTCUSDT', '15m', 'alert-15min'); // 15分钟K线
    monitorToken('BTCUSDT', '1h', 'alert-1hour'); // 1小时K线
    monitorToken('BTCUSDT', '4h', 'alert-4hour'); // 4小时K线
}

// 每30秒请求一次K线数据并监控下跌
setInterval(monitorAllTokens, 30000); // 每30秒钟请求一次
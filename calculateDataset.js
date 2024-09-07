const fs = require('fs');

const data = fs.readFileSync('dataSet.txt', 'utf8');

const rows = data.trim().split('\n');
const dataArray = rows.map(row => row.split(','));
const headers = dataArray[0];
const formattedData = [];

for (let i = 1; i < dataArray.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
        obj[headers[j].trim()] = dataArray[i][j].trim();
    }
    formattedData.push(obj);
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    return `${monthNames[parseInt(month) - 1]} ${year}`;
};

const calculateIceCreamParlourDataset = (dataSetArr) => {
    let totalSalesOfStore = dataSetArr.reduce((acc, rowData) => {
        return acc + parseFloat(rowData["Total Price"]);
    }, 0);

    let monthWiseSales = {};

    dataSetArr.forEach(rowData => {
        let month = formatMonth(rowData["Date"]);
        let totalPrice = parseFloat(rowData["Total Price"]);

        if (monthWiseSales[month]) {
            monthWiseSales[month] += totalPrice;
        } else {
            monthWiseSales[month] = totalPrice;
        }
    });

    return {
        totalSalesOfStore,
        monthWiseSales
    };
};

const calculateMostPopularItems = (dataSetArr) => {
    let monthWiseItems = {};

    dataSetArr.forEach(rowData => {
        let month = formatMonth(rowData["Date"]);
        let item = rowData["SKU"];
        let quantity = parseInt(rowData["Quantity"]);

        if (!monthWiseItems[month]) {
            monthWiseItems[month] = {};
        }
        if (monthWiseItems[month][item]) {
            monthWiseItems[month][item] += quantity;
        } else {
            monthWiseItems[month][item] = quantity;
        }
    });

    let mostPopularItems = {};
    for (let month in monthWiseItems) {
        let items = monthWiseItems[month];
        let maxQuantity = 0;
        let popularItem = '';

        for (let item in items) {
            if (items[item] > maxQuantity) {
                maxQuantity = items[item];
                popularItem = item;
            }
        }
        mostPopularItems[month] = { item: popularItem, quantity: maxQuantity };
    }

    return mostPopularItems;
};

const calculateMostRevenueItems = (dataSetArr) => {
    let monthWiseRevenue = {};

    dataSetArr.forEach(rowData => {
        let month = formatMonth(rowData["Date"]);
        let item = rowData["SKU"];
        let unitPrice = parseFloat(rowData["Unit Price"]);
        let quantity = parseInt(rowData["Quantity"]);
        let revenue = unitPrice * quantity;

        if (!monthWiseRevenue[month]) {
            monthWiseRevenue[month] = {};
        }
        if (monthWiseRevenue[month][item]) {
            monthWiseRevenue[month][item] += revenue;
        } else {
            monthWiseRevenue[month][item] = revenue;
        }
    });

    let mostRevenueItems = {};
    for (let month in monthWiseRevenue) {
        let items = monthWiseRevenue[month];
        let maxRevenue = 0;
        let topRevenueItem = '';

        for (let item in items) {
            if (items[item] > maxRevenue) {
                maxRevenue = items[item];
                topRevenueItem = item;
            }
        }
        mostRevenueItems[month] = { item: topRevenueItem, revenue: maxRevenue };
    }

    return mostRevenueItems;
};

const calculateMinMaxAvgOrdersForPopularItems = (dataSetArr) => {
    // Find the most popular items for each month
    const mostPopularItems = calculateMostPopularItems(dataSetArr);

    // Create an object to store order quantities for the most popular items
    let itemOrders = {};

    // Loop through the dataset to gather order quantities for the most popular items
    for (let i = 0; i < dataSetArr.length; i++) {
        let rowData = dataSetArr[i];
        let month = formatMonth(rowData["Date"]);
        let item = rowData["SKU"];
        let quantity = parseInt(rowData["Quantity"]);

        // Check if the item is the most popular item for the month
        if (mostPopularItems[month] && mostPopularItems[month].item === item) {
            // Initialize the array for this month if it doesn't exist
            if (!itemOrders[month]) {
                itemOrders[month] = [];
            }
            // Add the quantity to the list for this month
            itemOrders[month].push(quantity);
        }
    }

    // Create an object to store the min, max, and average orders for each month
    let results = {};

    // Loop through each month to calculate the min, max, and average orders
    for (let month in itemOrders) {
        let quantities = itemOrders[month];
        
        // Initialize min, max, and sum
        let minOrders = quantities[0];
        let maxOrders = quantities[0];
        let sumOrders = 0;

        // Loop through quantities to find min, max, and calculate the sum
        for (let j = 0; j < quantities.length; j++) {
            let quantity = quantities[j];
            
            if (quantity < minOrders) {
                minOrders = quantity;
            }
            
            if (quantity > maxOrders) {
                maxOrders = quantity;
            }
            
            sumOrders += quantity;
        }

        // Calculate average
        let avgOrders = sumOrders / quantities.length;

        // Store the results for this month
        results[month] = {
            minOrders,
            maxOrders,
            avgOrders
        };
    }

    return results;
};


const salesData = calculateIceCreamParlourDataset(formattedData);
console.log('Total Sales and Month-wise Sales:', salesData);

const popularItems = calculateMostPopularItems(formattedData);
console.log('Most Popular Items per Month:', popularItems);

const revenueItems = calculateMostRevenueItems(formattedData);
console.log('Items Generating the Most Revenue per Month:', revenueItems);

const ordersStats = calculateMinMaxAvgOrdersForPopularItems(formattedData);
console.log('Min, Max, and Average Orders for Most Popular Items per Month:', ordersStats);

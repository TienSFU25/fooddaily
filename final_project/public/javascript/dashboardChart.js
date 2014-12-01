// THIS HAS TO BE IN THE SAME ORDER AS IT WENT OUT FROM DATABASE.JS
var chartFields = {
    foodName: {
        type: 'string',
        hidden: false,
        display: 'Food'
    },
    brandName: {
        type: 'string',
        hidden: false,
        display: 'Brand'
    }, 
    calories: {
        type: 'number',
        hidden: false,
        display: 'Calories/serving'
    },
    amount: {
        type: 'number',
        hidden: false,
        display: 'Amount'
    },
    createdAt: {
        type: 'string',
        hidden: false,
        display: "Time eaten"
    }
}

var fakeData = [
['Mon Nov 24 2014', 1987],
['Tue Nov 25 2014', 1849],
['Wed Nov 26 2014', 2012],
['Thur Nov 27 2014', 2409],
['Fri Nov 28 2014', 1803],
]
var fakeTable = [
['Chicken Breast', 'McDonalds', 150, 2, 'Sun Nov-30-2014 06:43:55'],
['Tortilla', 'USDA', 237, 1, 'Sun Nov-30-2014 04:41:22'],
['Doritos', 'Frito-Lay', 245, 1, 'Sat Nov-29-2014 23:32:18'],
['Brown Rice', 'USDA', 150, 2, 'Sat Nov-29-2014 22:13:53'],
]
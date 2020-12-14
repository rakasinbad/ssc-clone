const testCase = {
	describe: 'OMS Page',
	positive: {
        getOMSPage: 'As an Admin, I want to access OMS Page',
        getOMSDetail: 'As an Admin, I want to access OMS Detail Page',
		getPendingTab: 'As an Admin, I want to filter OMS based on Pending Status',
		getPendingPaymentTab: 'As an Admin, I want to filter OMS based on Pending Payment Status',
		getNewOrderTab: 'As an Admin, I want to filter OMS based on New Order Status',
		getPackedTab: 'As an Admin, I want to filter OMS based on Packed Status',
		getShippedTab: 'As an Admin, I want to filter OMS based on Shipped Status',
		getDeliveredTab: 'As an Admin, I want to filter OMS based on Delivered Status',
		getDoneTab: 'As an Admin, I want to filter OMS based on Done Status',
		getCancelledTab: 'As an Admin, I want to filter OMS based on Cancelled Status'
	},
	negative: {
	}
};

module.exports = {
    testCase
}
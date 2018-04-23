/**
 * add a list of orders to the redux orders array
 * @param {RootState} state
 * @param {Array<Object>} orders array of orders
 * @return {RootState} a new state
 */
export function addOrders(state, orders) {
	return { ...state, orders };
}
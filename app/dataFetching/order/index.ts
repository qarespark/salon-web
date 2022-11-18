import { APISERVICE } from "@api/RestClient";

export const getOrderByOrderId = (id) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GET_ORDERS}/${id}`)  //get store details
            .then(async (ordersData) => {
                if (ordersData.status == 200) {
                    const orders = ordersData.data;
                    if (orders) {
                        res(orders)
                    } else {
                        rej({ err: 'ordersData data unavailable' });
                    }
                } else if (ordersData.status == 401) {
                    rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_GET_ORDERS}/${id}`, status: ordersData.status });
                }
            }).catch(function (error) {
                rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_GET_ORDERS}/${id}`, status: error });
                console.error("error", error);
            });
    })
};

export const getOrderByTenantIdAndGuestId = (guestid, tenantid) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GET_ORDERS_BY_TENANTID_GUESTID}/${tenantid}/${guestid}`)  //get order history
            .then(async (ordersData) => {
                if (ordersData.status == 200) {
                    const orders = ordersData.data;
                    if (orders) {
                        res(orders)
                    } else {
                        rej({ error: 'Order unavailable' });
                    }
                } else if (ordersData.status == 401) {
                    rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_GET_ORDERS_BY_TENANTID_GUESTID}/${tenantid}/${guestid}`, status: ordersData.status });
                }
            }).catch(function (error) {
                rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_GET_ORDERS_BY_TENANTID_GUESTID}/${tenantid}/${guestid}`, status: error });
                console.error("error", error);
            });
    })
};
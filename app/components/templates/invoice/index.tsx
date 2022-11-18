import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import router from "next/router";
import { getOrderByOrderId } from '@storeData/order';
import { ORDER_COMPLETED, ORDER_REJECTED } from '@constant/order';
import { disableLoader, enableLoader } from '@context/actions';
import OrderDetailModel from '@module/orderDetailModal';
import { navigateTo } from '@util/routerService';

function InvoicePage() {
    const dispatch = useDispatch();
    const baseRouteUrl = useSelector(state => state.store.baseRouteUrl);
    const [orderData, setOrderData] = useState(null)
    const orderId = router.query.pagepath ? router.query.pagepath[1] : '';

    useEffect(() => {
        if (orderId) {
            dispatch(enableLoader());
            getOrderByOrderId(orderId).then((order: any) => {
                dispatch(disableLoader());
                if (order) {
                    let settledTiming = new Date().toLocaleString();
                    if ((orderData?.statuses[orderData?.statuses?.length - 1]?.state == ORDER_COMPLETED) || (orderData?.statuses[orderData?.statuses?.length - 1]?.state == ORDER_REJECTED)) {
                        if (typeof (order.statuses[1].createdOn) == 'string') {
                            settledTiming = new Date(order?.statuses[order?.statuses?.length - 1]?.createdOn).toLocaleString();
                        } else {
                            settledTiming = order?.statuses[order?.statuses?.length - 1]?.createdOn.toLocaleString();
                        }
                    }
                    order.settledTiming = settledTiming;
                    setOrderData(order);
                }
            }).catch((error) => {
                dispatch(disableLoader());
                console.log(error);
                setOrderData('');
            })
        }
    }, [orderId])

    const redirectToHome = () => {
        navigateTo('home');
    }

    return (
        <div className="invoice-wrapper">
            <OrderDetailModel
                orderData={orderData}
                handleClose={() => { }} />
            <div className="footer-btn-wrap">
                <button className='primary-btn' onClick={redirectToHome}>Explore More Services & Products</button>
            </div>
        </div>
    )
}

export default InvoicePage
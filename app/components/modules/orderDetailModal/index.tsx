import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import router from "next/router";
import { ORDER_ACCEPTED, ORDER_COMPLETED, ORDER_FIX_DISCOUNT_TYPE, ORDER_PERCENTAGE_DISCOUNT_TYPE } from '@constant/order';
import { navigateTo } from '@util/routerService';

function OrderDetailModel({ handleClose, orderData }) {
    const baseRouteUrl = useSelector(state => state.store.baseRouteUrl);
    const { configData } = useSelector(state => state.store.storeData);
    const orderId = router.query.pagepath ? router.query.pagepath[1] : '';
    const storeMetaData = useSelector(state => state.store ? state.store.storeMetaData : null);
    const [orderStatus, setOrderStatus] = useState('')
    const [billingObj, setBillingObj] = useState<any>({
        service: { items: [], discount: null, appliedTaxes: [], subtotal: 0, total: 0, taxesTotal: 0 },
        product: { items: [], discount: null, appliedTaxes: [], subtotal: 0, total: 0, taxesTotal: 0 },
        overAll: { items: [], discount: null, appliedTaxes: [], subtotal: 0, total: 0, taxesTotal: 0 },
        payment: { payMode: '', payments: [] }
    })
    const [availableTypes, setAvailableTypes] = useState<any>(['product', 'service']);

    useEffect(() => {
        if (orderData) {
            setOrderStatus(orderData?.statuses[orderData?.statuses?.length - 1]?.state);
            const orderCopy = { ...orderData };
            const availableTypesFromOrder = Array.from(new Set(orderCopy.products.map((p: any) => p.type)));
            availableTypesFromOrder.map((type: any) => {
                const billingObjCopy = { ...billingObj };
                billingObjCopy[type].items = orderCopy.products.filter((i: any) => i.type == type);

                if (orderCopy.discount) {
                    if (Object.prototype.toString.call(orderCopy.discount) === '[object Array]') {
                        //type wise discount
                        let appliedDiscount = orderCopy.discount.filter((d: any) => d.onType == type);
                        billingObjCopy[type].discount = appliedDiscount.length != 0 ? appliedDiscount[0] : null;
                    } else {
                        //common discount
                        billingObjCopy[type].discount = orderCopy.discount;
                    }
                }
                setAvailableTypes(availableTypesFromOrder);
                setBillingObj({ ...billingObjCopy });
            })
        }
    }, [orderData])

    useEffect(() => {
        //for products calculations
        const billingObjCopy = { ...billingObj };
        billingObjCopy.overAll = { items: [], discount: null, appliedTaxes: [], subtotal: 0, total: 0, taxesTotal: 0 };
        availableTypes.map((type: any, typeIndex: number) => {
            let appliedTaxes: any[] = [];
            let subtotal: any = 0;
            let total: any = 0;
            let taxesTotal: any = 0;
            billingObjCopy[type].items.map((product: any, i: number) => {

                // here variation price not considered because at the time of order booking it is set inside products object as price and salePrice
                let applicablePrice: any = (parseFloat(product.billingPrice) || parseFloat(product.salePrice) || parseFloat(product.price)) * product.quantity;
                if ((product.complementary?.remark)) {//if item is complimentary do not calculate price
                    applicablePrice = 0;
                }
                subtotal += parseFloat(applicablePrice);
                total += parseFloat(applicablePrice);
                if (product.txchrgs) {
                    product.txchrgs.map((taxData: any) => {
                        if (applicablePrice) {
                            let tDetails = configData?.txchConfig ? configData?.txchConfig?.filter((t: any) => t.name == taxData.name) : [];
                            //update global total
                            if (tDetails.length != 0) {
                                const taxApplied = Number(((parseFloat(applicablePrice) / 100) * parseFloat(tDetails[0].value)).toFixed(2))
                                total = Number((total + taxApplied).toFixed(2));

                                //update global applied taxes total
                                let isAVl = appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                                if (isAVl != -1) {
                                    appliedTaxes[isAVl].total = Number((appliedTaxes[isAVl].total + taxApplied).toFixed(2));
                                } else {
                                    appliedTaxes.push({ name: taxData.name, value: tDetails[0].value, total: taxApplied })
                                }
                                taxesTotal = Number((taxesTotal + taxApplied).toFixed(2));
                                //update global applied taxes total

                                //overAll tax calculation
                                let isAVlinOverall = billingObjCopy.overAll.appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                                if (isAVlinOverall != -1) {
                                    billingObjCopy.overAll.appliedTaxes[isAVlinOverall].total = Number((billingObjCopy.overAll.appliedTaxes[isAVlinOverall].total + taxApplied).toFixed(2));
                                } else {
                                    billingObjCopy.overAll.appliedTaxes.push({ name: taxData.name, value: tDetails[0].value, total: taxApplied })
                                }
                                //overAll tax calculation

                            }
                        }
                    })
                }
                if (i == billingObjCopy[type].items.length - 1) {
                    //if any discount applied
                    if (billingObjCopy[type].discount) {
                        let discountValue = 0;
                        if (billingObjCopy[type].discount.type == ORDER_FIX_DISCOUNT_TYPE) {
                            discountValue = parseFloat(billingObjCopy[type].discount.value);
                        } else {
                            discountValue = Number((billingObjCopy[type].discount.value * (subtotal + taxesTotal)) / 100)
                        }
                        total = Number(parseFloat(total) - discountValue);
                        // overAll discount calculations
                        billingObjCopy.overAll.discount = Number((billingObjCopy.overAll.discount + Number(discountValue)).toFixed(2));
                        // overAll discount calculations
                    }

                    //update type wise charges on evry product iteration
                    billingObjCopy[type].appliedTaxes = appliedTaxes;
                    billingObjCopy[type].taxesTotal = taxesTotal;
                    billingObjCopy[type].subtotal = subtotal;
                    billingObjCopy[type].total = total;
                }
            })

            //update overAll charges when all products loop ends
            billingObjCopy.overAll.taxesTotal = Number(billingObjCopy.overAll.taxesTotal + parseFloat(taxesTotal));
            billingObjCopy.overAll.subtotal = Number(billingObjCopy.overAll.subtotal + parseFloat(subtotal));
            billingObjCopy.overAll.total = Number(billingObjCopy.overAll.total + parseFloat(total));
            console.log("billingObjCopy", billingObjCopy)
            if (typeIndex == availableTypes.length - 1) {
                if (billingObj.overAll.total != billingObjCopy.overAll.total) {
                    setBillingObj(billingObjCopy);
                }
            }
        })
    }, [billingObj])

    const redirectToHome = () => {
        navigateTo('home');
    }

    return (
        <div className="invoice-wrapper">
            {/* <div className='page-heading'>Order Invoice</div> */}
            {orderData ? <div className="invoice-page-wrap">
                <div className='salon-details-wrap'>
                    <div className='logo-wrap'>
                        <img src={storeMetaData.logoPath} alt="Respark" />
                    </div>
                    <div className='salon-details'>
                        <div className='name'>{storeMetaData?.name}</div>
                        <div className='address s-detail'>{storeMetaData?.address}, {storeMetaData?.area}, {storeMetaData?.city}, {storeMetaData?.state}
                            {storeMetaData?.pincode && <>, {storeMetaData?.pincode}</>}
                        </div>
                        <div className='phone s-detail'>{storeMetaData?.phone}
                            {storeMetaData?.phone1 && storeMetaData?.phone && <>, </>}
                            {storeMetaData?.phone1 && <>{storeMetaData?.phone1}</>}
                        </div>
                        <div className='email s-detail'>{storeMetaData?.email}</div>
                        {storeMetaData?.gstn && <div className='gstn s-detail'>GSTN: {storeMetaData?.gstn}</div>}
                    </div>
                </div>
                <div className='user-details-wrap'>
                    <div className='user-details'>
                        <div className='subheading'>Bill to:</div>
                        <div className='name'>{orderData?.guest}</div>
                        <div className='phone'>{orderData?.phone} {orderData?.email && <>{orderData?.email}</>}</div>
                    </div>
                    <div className='date-wrap'>
                        {/* <div className='date'><span>Created On: </span>{orderData?.createdOn?.substring(0, 10)} {`${new Date(orderData?.createdOn).getHours()}:${new Date(orderData?.createdOn).getMinutes()}`}</div>
                        <div className='time'><span>Order Date: </span>{new Date(orderData?.orderDay).toLocaleDateString()}, {new Date(orderData?.orderDay).toLocaleTimeString()}</div> */}
                        <div className='subheading'>Order Id: <div className='order-id'>{orderData?.orderId}</div></div>
                        <div className='subheading'>Date: <div className='time'>{orderData?.orderDay?.substring(0, 10)}</div></div>
                        <div className='subheading'>Time: <div className='time'>{`${new Date(orderData?.createdOn).getHours()}:${new Date(orderData?.createdOn).getMinutes()}`}</div></div>

                    </div>
                </div>

                {availableTypes.map((type: any, ti: number) => {
                    return <React.Fragment key={ti}>
                        {billingObj[type].items.length != 0 && <div className="bill-item-type-wrap">
                            <div className="heading cap-text">{type} Bill</div>
                            <div className='invoice-details-wrap order-invoice-details'>
                                <div className='services-list-wrap'>
                                    <div className='heading-wrap d-f-c'>
                                        <div className='srnumber'>Sr.</div>
                                        <div className='name'>Item</div>
                                        <div className='expert'>Expert</div>
                                        <div className='qty'>Qty.</div>
                                        <div className='amt'>Amt.</div>
                                    </div>
                                    <div className='details-wrap'>
                                        {billingObj[type].items.map((itemDetails: any, i: number) => {
                                            return <div key={i} className='service-details d-f-c'>
                                                <div className='srnumber'>{i + 1}</div>
                                                <div className='name'><span>{itemDetails.category}</span> - {itemDetails.name}
                                                    {itemDetails.variations && itemDetails.variations.length != 0 && <div className='variations-wrap'>
                                                        ({itemDetails.variations[0].name}
                                                        {itemDetails.variations.length != 0 && itemDetails.variations[0]?.variations && itemDetails.variations[0]?.variations?.length != 0 &&
                                                            <>-{itemDetails.variations[0]?.variations[0]?.name}</>}
                                                        {itemDetails.variations.length != 0 && itemDetails.variations[0]?.variations && itemDetails.variations[0]?.variations?.length != 0 && itemDetails.variations[0]?.variations[0]?.variations?.length != 0 &&
                                                            <>-{itemDetails.variations[0]?.variations[0]?.variations[0]?.name}</>})
                                                    </div>}
                                                </div>
                                                {itemDetails.staff ? <div className='expert d-f-c'>{itemDetails.staff}</div> :
                                                    <div className='expert'>-</div>}
                                                <div className='qty'>{itemDetails.quantity}</div>
                                                {itemDetails.complementary?.remark ? <div className='amt'>0</div> :
                                                    <div className='amt'>
                                                        {((itemDetails.billingPrice || itemDetails.salePrice || itemDetails.price) * itemDetails.quantity)}
                                                    </div>}
                                            </div>
                                        })}
                                    </div>
                                </div>
                                <div className='invoice-total-details-wrap type-wise-order-invoice'>
                                    <div className='total-details'>
                                        <div className='total-entity-wrap'>
                                            <div className='title'>SubTotal</div>
                                            <div className='value'>₹{billingObj[type]?.subtotal}</div>
                                        </div>
                                        {billingObj[type].taxesTotal != 0 && billingObj[type].appliedTaxes.map((taxData: any, i: number) => {
                                            return <div className="total-entity-wrap" key={i}>
                                                <div className='title' >{taxData.name}({taxData.value}%)</div>
                                                <div className='value' >₹{taxData.total}</div>
                                            </div>
                                        })}
                                        {billingObj[type].discount && <div className="total-entity-wrap">
                                            {<div className='title'>Discount{billingObj[type].discount?.type == ORDER_PERCENTAGE_DISCOUNT_TYPE && <>({billingObj[type].discount?.value}%)</>}</div>}
                                            {billingObj[type].discount?.type == ORDER_FIX_DISCOUNT_TYPE ? <>
                                                <div className='value'>₹{billingObj[type].discount?.value} </div>
                                            </> : <>
                                                <div className='value'>₹{(billingObj[type].discount?.value * (Number(billingObj[type].taxesTotal) + Number(billingObj[type].subtotal)) / 100).toFixed(1)}</div>
                                            </>}
                                        </div>}
                                        <div className="total-entity-wrap">
                                            <div className='title'>Grand Total</div>
                                            <div className='value'>₹{billingObj[type].total}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    </React.Fragment>
                })}

                <div className="bill-item-type-wrap">
                    {availableTypes.length > 1 && <>
                        <div className="heading cap-text">Combine bill total (Services + Products)</div>
                        <div className='invoice-total-details-wrap type-wise-order-invoice'>
                            <div className='total-details overall-total-wrap'>
                                <div className='total-entity-wrap'>
                                    <div className='title'>SubTotal</div>
                                    <div className='value'>₹ {billingObj.overAll?.subtotal}</div>
                                </div>
                                {billingObj.overAll.taxesTotal != 0 && billingObj.overAll.appliedTaxes.map((taxData: any, i: number) => {
                                    return <div className="total-entity-wrap" key={i}>
                                        <div className='title' >{taxData.name}({taxData.value}%)</div>
                                        <div className='value' >₹ {taxData.total}</div>
                                    </div>
                                })}
                                {!!billingObj.overAll.discount && <div className="total-entity-wrap">
                                    <div className='title'>Discount</div>
                                    <div className='value'>₹ {billingObj.overAll.discount} </div>
                                </div>}
                                <div className="total-entity-wrap">
                                    <div className='title'>Grand Total</div>
                                    <div className='value'>₹ {billingObj.overAll.total}</div>
                                </div>
                            </div>
                        </div>
                    </>}
                </div>
                {(orderStatus == ORDER_COMPLETED || orderStatus == ORDER_ACCEPTED) && <div className='payment-wrap'>
                    <div className='payment-by d-f-c'>
                        <div className='paid-via'>
                            <span>Paid  @{orderData?.settledTiming} Via : </span>
                            {orderData?.payMode && <>{orderData?.payMode}</>}
                        </div>
                    </div>
                </div>}
                <div className='note'>
                    Thank you for visiting us
                </div>
            </div> : <>
                {orderId ? <div className='no-data card'>
                    The invoice you are looking for is not available
                </div> : <div className='no-data card'>
                    Invalid link
                </div>}
            </>}
            {/* <div className="footer-btn-wrap">
                <button className='primary-btn' onClick={redirectToHome}>Explore More Services & Products</button>
            </div> */}
        </div>
    )
}

export default OrderDetailModel
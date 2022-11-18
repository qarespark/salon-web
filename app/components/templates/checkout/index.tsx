/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { replaceOrderIitems, syncLocalStorageOrder } from "app/redux/actions/order";
import { windowRef } from '@util/window';
import { APISERVICE } from '@util/apiService/RestClient';
import { disableLoader, enableLoader, showError, updateCurrentPage, updatePdpItem, updateStore, updateWhatsappTemplates } from 'app/redux/actions';
import router from "next/router";
import { useCookies } from "react-cookie";
import { updateUserData } from '@context/actions/user';
import AddressModal from '@module/addressModal';
import Footer from '@module/footer';
import ConfirmationModal from '@module/confirmationModal';
import { getUserByTenantAndMobile, markUserOptInForWhatsapp } from '@storeData/user';
import UserRegistrationModal from '@module/userRegistration';
import { ORDER_REQUESTED } from '@constant/order';
import { PRODUCT } from '@constant/types';
import Backdrop from '@material-ui/core/Backdrop';
import { getAllTemplates, markUserOptIn, sendWhatsappMsgMessage } from '@storeData/whatsapp';
import { QUOTE_REQUEST_TO_OWNER, QUOTE_REQUEST_TO_USER } from '@constant/whatsappTemplates';
import { markStoreOptInForWhatsapp } from '@storeData/store';
import Script from 'next/script';
import SvgIcon from '@element/svgIcon';
import { navigateTo } from '@util/routerService';

function FaUserEdit(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 640 512" height="1em" width="1em" {...props}><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h274.9c-2.4-6.8-3.4-14-2.6-21.3l6.8-60.9 1.2-11.1 7.9-7.9 77.3-77.3c-24.5-27.7-60-45.5-99.9-45.5zm45.3 145.3l-6.8 61c-1.1 10.2 7.5 18.8 17.6 17.6l60.9-6.8 137.9-137.9-71.7-71.7-137.9 137.8zM633 268.9L595.1 231c-9.3-9.3-24.5-9.3-33.8 0l-37.8 37.8-4.1 4.1 71.8 71.7 41.8-41.8c9.3-9.4 9.3-24.5 0-33.9z" /></svg>;
}

function RiTakeawayLine(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path fillRule="nonzero" d="M16,1 C16.5522847,1 17,1.44771525 17,2 L17,2.999 L22,3 L22,9 L19.98,8.999 L22.7467496,16.595251 C22.9104689,17.0320314 23,17.5050658 23,17.9990113 C23,20.2081503 21.209139,21.9990113 19,21.9990113 C17.1367966,21.9990113 15.5711292,20.7251084 15.1264725,19.0007774 L10.8737865,19.0007613 C10.429479,20.7256022 8.86356525,22 7,22 C5.05513052,22 3.43445123,20.6119768 3.07453347,18.7725019 C2.43557576,18.4390399 2,17.770387 2,17 L2,12 L11,12 C11,12.5128358 11.3860402,12.9355072 11.8833789,12.9932723 L12,13 L14,13 C14.5128358,13 14.9355072,12.6139598 14.9932723,12.1166211 L15,12 L15,3 L12,3 L12,1 L16,1 Z M7,16 C5.8954305,16 5,16.8954305 5,18 C5,19.1045695 5.8954305,20 7,20 C8.1045695,20 9,19.1045695 9,18 C9,16.8954305 8.1045695,16 7,16 Z M19,16 C17.8954305,16 17,16.8954305 17,18 C17,19.1045695 17.8954305,20 19,20 C20.1045695,20 21,19.1045695 21,18 C21,16.8954305 20.1045695,16 19,16 Z M10,3 C10.5522847,3 11,3.44771525 11,4 L11,11 L2,11 L2,4 C2,3.44771525 2.44771525,3 3,3 L10,3 Z M20,5 L17,5 L17,7 L20,7 L20,5 Z M9,5 L4,5 L4,6 L9,6 L9,5 Z"></path></g></svg>;
}

function MdDirectionsRun(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" /></svg>;
}

function BiArrowBack(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M21 11L6.414 11 11.707 5.707 10.293 4.293 2.586 12 10.293 19.707 11.707 18.293 6.414 13 21 13z" /></svg>;
}

function CgWorkAlt(props) {
    return <svg stroke="currentColor" fill="none" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path fillRule="evenodd" clipRule="evenodd" d="M17 7C17 5.34315 15.6569 4 14 4H10C8.34315 4 7 5.34315 7 7H6C4.34315 7 3 8.34315 3 10V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V10C21 8.34315 19.6569 7 18 7H17ZM14 6H10C9.44772 6 9 6.44772 9 7H15C15 6.44772 14.5523 6 14 6ZM6 9H18C18.5523 9 19 9.44772 19 10V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V10C5 9.44772 5.44772 9 6 9Z" fill="currentColor" /></svg>;
}

function AiOutlineHome(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 1024 1024" height="1em" width="1em" {...props}><path d="M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 0 0-44.4 0L77.5 505a63.9 63.9 0 0 0-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0 0 18.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z" /></svg>;
}

function GrLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path fill="none" stroke="#000" strokeWidth={2} d="M12,22 C12,22 4,16 4,10 C4,5 8,2 12,2 C16,2 20,5 20,10 C20,16 12,22 12,22 Z M12,13 C13.657,13 15,11.657 15,10 C15,8.343 13.657,7 12,7 C10.343,7 9,8.343 9,10 C9,11.657 10.343,13 12,13 L12,13 Z" /></svg>;
}

function MdEditLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm-1.56 10H9v-1.44l3.35-3.34 1.43 1.43L10.44 12zm4.45-4.45l-.7.7-1.44-1.44.7-.7c.15-.15.39-.15.54 0l.9.9c.15.15.15.39 0 .54z" /></svg>;
}

function MdAddLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm4 8h-3v3h-2v-3H8V8h3V5h2v3h3v2z" /></svg>;
}

function GrFormLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>;
}

function CheckoutPage() {
    const [pricingBreakdown, setpricingBreakdown] = useState({ total: 0, subTotal: 0, appliedTaxes: [] });
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state.orderItems);
    const storeData = useSelector(state => state.store.storeData);
    const { configData, keywords } = useSelector(state => state.store ? state.store.storeData : null);
    const { gupshupConfig } = configData?.storeConfig;
    const store = useSelector(state => state.store);
    const baseRouteUrl = useSelector(state => state.store.baseRouteUrl);
    const [cookie, setCookie] = useCookies();
    const [userData, setUserCookie] = useState(cookie['user']);
    const [activeGroup, setActiveGroup] = useState(cookie['grp']);
    const [orderInstruction, setOrderInstruction] = useState('')
    const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
    const [orderType, setOrderType] = useState('delivery');
    const [openAddressModal, setOpenAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<any>('');
    const [selectedAddressType, setSelectedAddressType] = useState('Home');
    const [selectedAddressToEdit, setSelectedAddressToEdit] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [showOrderingOff, setShowOrderingOff] = useState(false);
    const [openUserUpdationModal, setOpenUserUpdationModal] = useState(false);
    const [showTotalBreakdownPopup, setShowTotalBreakdownPopup] = useState(false);
    const storeMetaData = useSelector(state => state.store ? state.store.storeMetaData : null);
    const whatsappTemplates = store.whatsappTemplates;

    const [userAddresses, setUserAddresses] = useState([
        { type: 'Home', value: null, isNew: false, isEdited: false, icon: <AiOutlineHome /> },
        { type: 'Work', value: null, isNew: false, isEdited: false, icon: <CgWorkAlt /> },
        { type: 'Other', value: null, isNew: false, isEdited: false, icon: <GrLocation /> },
    ])

    useEffect(() => {
        setActiveGroup(cookie['grp'])
        if (cookie['user']) {
            setUserCookie(cookie['user']);
            dispatch(updateUserData(cookie['user']))
        }
    }, [cookie])

    useEffect(() => {
        if (windowRef) {
            dispatch(syncLocalStorageOrder());
            dispatch(updatePdpItem(null));
            if (userData) {
                getUserDetails(userData.mobileNo).then((res) => {
                    setUserCookie(res);
                    setCookie("user", res, { //user registration fields
                        path: "/",
                        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        sameSite: true,
                    })
                    dispatch(updateUserData(res))
                })
            } else {
                navigateTo('home');
            }
        }
    }, [windowRef])

    useEffect(() => {
        if (userData && configData.deliveryOn) {

            if (userData?.addressList) {
                const userAddressesCopy = [...userAddresses];
                userAddressesCopy.map((userAdd) => {
                    userData.addressList.map((data) => {
                        if (userAdd.type == data.type) {
                            userAdd.value = data;
                        }
                    })
                })
                const isAnyAddAvl = userAddressesCopy.filter((data) => data.value && data.value.line);
                if (isAnyAddAvl.length != 0) {
                    setSelectedAddressType(isAnyAddAvl[0].type);
                    setSelectedAddress(isAnyAddAvl[0].value)
                } else {
                    setOpenAddressModal(true);
                }
                setUserAddresses(userAddressesCopy);
            } else {
                setActiveAddressType(userAddresses[0]);
                // setOpenAddressModal(true);
            }
        }
    }, [userData])

    useEffect(() => {
        if (cartItems && cartItems.length) {
            let total: any = 0;
            let subTotal: any = 0;
            let appliedTaxes: any[] = [];
            cartItems.map((cartItem) => {
                let applicablePrice: any = (cartItem.salePrice || cartItem.price) * cartItem.quantity;
                subTotal += parseFloat(applicablePrice);
                total += parseFloat(applicablePrice);

                if (cartItem.txchrgs) {
                    cartItem.txchrgs.map((taxData: any) => {
                        //update global total
                        total += taxData.value;
                        //update global applied taxes total
                        let isAVl = appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                        if (isAVl != -1) {
                            appliedTaxes[isAVl].total += taxData.value;
                        } else {
                            appliedTaxes.push({ name: taxData.name, value: ((100 * taxData.value) / applicablePrice).toFixed(1), total: taxData.value })
                        }
                    })
                }

            })
            setpricingBreakdown({ total, subTotal, appliedTaxes });
        }
    }, [cartItems])


    useEffect(() => {
        if (configData) {
            if (!configData.deliveryOn) setOrderType('pickup');
        }
    }, [configData])

    const handleOrderConfirmationMOdalResponse = () => {
        navigateTo('home');
    }

    const checkForOptIn = (type: any, typeDetails: any) => {
        return new Promise((res, rej) => {
            if (type.optInForWapp) res(true)
            else {
                markUserOptIn(gupshupConfig, type.number).then(() => {
                    //update in db
                    if (type.from == 'user') {
                        markUserOptInForWhatsapp(storeMetaData.tenantId, storeMetaData.id, [type.number]).then(() => {
                            const userDeta = { ...typeDetails, optInForWapp: true }
                            setCookie("user", userDeta, { //user registration fields
                                path: "/",
                                expires: new Date(new Date().setSeconds(new Date().getFullYear() + 1)),
                                sameSite: true,
                            })
                        })
                    } else {
                        markStoreOptInForWhatsapp(storeMetaData.tenantId).then(() => {
                            const storeCopy = { ...store }
                            storeCopy.storeMetaData.optInForWapp = true;
                            dispatch(updateStore({ ...storeCopy }));
                        })
                    }
                    res(true);
                })
            }
        })
    }

    const getItemsMsgString = () => {
        let itemmsg = `${cartItems[0].categoryName} - ${cartItems[0].name}`;
        if (cartItems.length != 1) {
            itemmsg = '';
            cartItems.map((item: any, i: number) => {
                itemmsg = itemmsg ? `${itemmsg}, ${i + 1}. ${item.categoryName} - ${item.name}` : `${i + 1} ${item.categoryName} - ${item.name}`;
            })
        }
        return itemmsg;
    }
    const sendReqMessageToUser = (templates: any[], user: any) => {
        const template = templates.filter((t: any) => t.elementName == QUOTE_REQUEST_TO_USER);
        const templObj: any = {
            id: template[0].id,
            params: [user.firstName, `${storeMetaData.name} ${storeMetaData.businessType}`, `${getItemsMsgString()}`, storeMetaData.phone, `${storeMetaData.sUrl}`]
        }
        const body = {
            template: JSON.stringify(templObj),
            source: 91 + gupshupConfig.number,
            destination: 91 + user.mobileNo,
        }
        sendWhatsappMsgMessage(gupshupConfig, body).then(() => {
            // dispatch(showSuccess('Quote request send successfully', 2000));
        }).catch((err) => {
            // dispatch(showError('Quote request sending failed'))
            console.log(err)
        })
    }

    const sendReqMessageToOwner = (templates: any[], user: any) => {
        const template = templates.filter((t: any) => t.elementName == QUOTE_REQUEST_TO_OWNER);
        const templObj: any = {
            id: template[0].id,
            params: [`${storeMetaData.name} ${storeMetaData.businessType}`, user.firstName, user.mobileNo, `${getItemsMsgString()}`, `${storeMetaData.sUrl}`]
        }
        const body = {
            template: JSON.stringify(templObj),
            source: 91 + gupshupConfig.number,
            destination: 91 + storeMetaData.phone1
            // destination: 91 + user.mobileNo,
        }
        dispatch(enableLoader());
        checkForOptIn({ from: 'store', number: storeMetaData.phone, optInForWapp: storeMetaData.optInForWapp }, storeMetaData).then(() => {
            sendWhatsappMsgMessage(gupshupConfig, body).then(() => {
                checkForOptIn({ from: 'user', number: user.mobileNo, optInForWapp: user.optInForWapp }, user).then(() => {
                    sendReqMessageToUser(templates, user);
                })
                dispatch(disableLoader());
            }).catch((err) => {
                // dispatch(showError('Quote request sending failed'))
                console.log(err)
                dispatch(disableLoader());
            })
        })
    }

    const sendWhatsappMsg = (user: any) => {
        if (whatsappTemplates && whatsappTemplates?.length != 0) {
            sendReqMessageToOwner(whatsappTemplates, user)
        } else {
            getAllTemplates(gupshupConfig)
                .then((res: any) => {
                    if (res) {
                        console.log(res)
                        dispatch(updateWhatsappTemplates(res));
                        sendReqMessageToOwner(res, user)
                    }
                    else {
                        // dispatch(showError('Quote request sending failed'))
                        // dispatch(disableLoader());
                    }
                })
                .catch((err: any) => {
                    // dispatch(showError('Quote request sending failed'))
                    // dispatch(disableLoader());
                    console.log(err)
                })
        }

    }

    const createOrder = (user, status) => {
        if (orderType == 'delivery' && !selectedAddress) {
            dispatch(showError('Please add delivery address'));
        } else {
            dispatch(enableLoader());
            cartItems.map((item) => {
                item.category = item.categoryName;
                item.type = keywords[PRODUCT];
                delete item.imagePaths
                item.billingPrice = item.salePrice || item.price;
            });
            const order = {
                "storeId": storeData.storeId,
                "tenant": storeData.tenant,
                "store": storeData.store,
                "tenantId": storeData.tenantId,
                "storeKey": storeData.storeKey,
                "guest": user.firstName,
                "guestId": user.id,
                "phone": user.mobileNo,
                "email": user.email,
                "remark": orderInstruction,
                "subtotal": pricingBreakdown.subTotal,
                "total": pricingBreakdown.total,
                "orderDay": new Date(),
                "createdOn": new Date(),
                "appointment": null,
                "products": cartItems,
                "type": orderType,
                "statuses": [
                    {
                        "state": ORDER_REQUESTED,
                        "staff": null,
                        "createdOn": new Date()
                    }
                ]
            }
            if (orderType == 'delivery') {
                order['address'] = selectedAddress;
            }
            if (status == 'pay_later') {
                //create regular pay later order
                APISERVICE.POST(process.env.NEXT_PUBLIC_PLACE_ORDER, order).then((res) => {
                    setTimeout(() => {
                        // sendWhatsappMsg(user)
                        setOrderData(res.data)
                        setShowOrderConfirmation(true);
                        dispatch(disableLoader());
                        dispatch(updateCurrentPage('orderconfirmation'));
                        dispatch(replaceOrderIitems([]));
                    }, 1000)
                }).catch((error) => {
                    console.log(error);
                    dispatch(disableLoader());
                    dispatch(showError('Order creation failed'))
                })
            } else {//create razor pay order
                APISERVICE.POST(process.env.NEXT_PUBLIC_PLACE_ORDER_RAZOR_PAY, order).then((res) => {
                    setTimeout(() => {
                        const { Razorpay }: any = window;
                        const rzp1 = new Razorpay(res.data);
                        rzp1.open();
                        dispatch(disableLoader());
                    }, 1000)
                }).catch((error) => {
                    console.log(error);
                    dispatch(disableLoader());
                    dispatch(showError('Order creation failed'))
                })
            }
        }
    }

    const proceedOrder = (status) => {
        if (configData?.orderingOn && !configData?.storeOff && !configData?.readOnlyMenu && (configData.deliveryOn || configData.pickupOn)) {
            if (userData) {
                createOrder(userData, status);
            }
        } else {
            setShowOrderingOff(true);
        }
    }

    const getUserDetails = (mobileNo) => {
        dispatch(enableLoader());
        return new Promise((res, rej) => {
            getUserByTenantAndMobile(storeData?.tenantId, storeData?.storeId, mobileNo).then((response) => {
                dispatch(disableLoader());
                res(response);
            }).catch(function (error) {
                dispatch(disableLoader());
                rej(error);
                console.log("error");
            });
        });
    }


    const handleAddressModalResponse = (address) => {
        if (address) {
            const newAddress = { ...address };
            const userAddressesCopy = [...userAddresses];
            userAddressesCopy.map((userAdd) => {
                if (userAdd.type == newAddress.type) {
                    userAdd.value = address;
                }
            })
            setSelectedAddressType(address.type);
            setUserAddresses(userAddressesCopy);
            setSelectedAddress(newAddress)
        }
        setSelectedAddressToEdit(null);
        setOpenAddressModal(false)
    }

    const setActiveAddressType = (address) => {
        if (address.value) {
            setSelectedAddressType(address.type);
        } else {
            setSelectedAddressToEdit({ type: address.type })
            setOpenAddressModal(true);
        }
    }

    const editAddress = (address) => {
        setSelectedAddressToEdit(address);
        setOpenAddressModal(true);
    }


    const onUserUpdationClose = (userData) => {
        setOpenUserUpdationModal(false);
    }

    return (
        <div className="cart-page-wrap main-wrapper">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            {!showOrderConfirmation ?
                <>
                    {cartItems.length != 0 ?
                        < div className='checkout-page-wrap clearfix'>
                            {/* <div className="page-heading">
                                <div className='icon' onClick={() => router.back()}><BiArrowBack /></div>
                                Order details
                            </div> */}
                            {userData && <div className="guest-details-wrap glass-card">
                                <div className='sub-heading'>Guest Details</div>
                                <div className="username">{userData.firstName} {userData.lastName}</div>
                                <div className="usernumber">{userData.mobileNo}</div>
                                <div className="usernumber">{userData.email}</div>
                                <div className="edit-user-icon d-f-c" onClick={(e) => setOpenUserUpdationModal(true)}><FaUserEdit /></div>
                            </div>}

                            {/* order type --delivery/pickup */}
                            <div className="order-type-wrap glass-card">
                                <div className='sub-heading'>Order Type</div>
                                <div className='order-type'>
                                    {configData?.deliveryOn && <div className={`type-btn ${orderType == 'delivery' ? 'active' : ''}`} onClick={() => setOrderType('delivery')}>
                                        <div className='icon-wrap'>
                                            <RiTakeawayLine />
                                        </div>
                                        Delivery
                                    </div>}
                                    {configData?.pickupOn && <div className={`type-btn ${orderType == 'pickup' ? 'active' : ''}`} onClick={() => setOrderType('pickup')} >
                                        <div className='icon-wrap'>
                                            <MdDirectionsRun />
                                        </div>
                                        Pickup
                                    </div>}
                                </div>
                            </div>
                            {(orderType == 'delivery') ? <div className="address-wrap glass-card">
                                <div className="sub-heading">Delivery Address</div>
                                {userAddresses.map((address) => {
                                    return <div className={`add-type-details glass-card ${selectedAddressType == address.type ? 'active' : ''}`} key={Math.random()} onClick={() => setActiveAddressType(address)}>
                                        <div className="type-icon-wrap">
                                            <div className="icon-wrap d-f-c">{address.icon}</div>
                                            <div className="type-name">{address.type}</div>
                                        </div>
                                        {address.value && address.value.line ? <div className="address-details">
                                            <div className="line">{address.value.line}</div>
                                            <div className="line">
                                                {address.value.area && <>{address.value.area},</>}
                                                {address.value.city && <>{address.value.city},</>}
                                                {address.value.code && <>{address.value.code}</>}
                                            </div>
                                            <div className="edit-address-icon d-f-c" onClick={() => editAddress(address.value)}><MdEditLocation /></div>
                                        </div> :
                                            <div className="address-details">
                                                <div className="line">No address saved yet</div>
                                                <div className="edit-address-icon d-f-c" onClick={() => setOpenAddressModal(true)}><MdAddLocation /></div>
                                            </div>
                                        }
                                    </div>
                                })}
                            </div>
                                :
                                <div className="address-wrap glass-card">
                                    <div className="sub-heading">Pickup Address</div>
                                    <div className='add-type-details glass-card active'>
                                        <div className="type-icon-wrap">
                                            <div className="icon-wrap d-f-c"><GrFormLocation /></div>
                                            <div className="type-name">{store?.storeMetaData?.name}</div>
                                        </div>
                                        <div className="address-details">
                                            <div className="line">{store?.storeMetaData?.address}, {store?.storeMetaData?.city}, {store?.storeMetaData?.state}, {store?.storeMetaData?.pincode}</div>
                                        </div>
                                    </div>
                                </div>
                            }

                            <div className="summary-details-wrap glass-card">
                                <div className='sub-heading'>Bill Details</div>
                                <div className='cart-items-list'>
                                    {cartItems?.map((item, i) => {
                                        return <div className="item-details clearfix" key={Math.random()}>
                                            <div className="item-name">{i + 1}. {item.name} ({item.quantity})</div>
                                            <div className="item-price">{configData.currencySymbol} {item.salePrice || item.price}</div>
                                        </div>
                                    })}
                                </div>
                                <div className='total-wrap'>
                                    <div className='price-wrap'>
                                        <div className='type'>Subtotal</div>
                                        <div className='value'>{configData.currencySymbol} {pricingBreakdown.subTotal}</div>
                                    </div>
                                    {pricingBreakdown.appliedTaxes?.map((taxData: any, i: number) => {
                                        return <div className='price-wrap' key={Math.random()}>
                                            <div className='type'>{taxData.name}({taxData.value}%)</div>
                                            <div className='value'>{configData.currencySymbol} {taxData.total}</div>
                                        </div>
                                    })}
                                    <div className='price-wrap grand-total'>
                                        <div className='type'>Grand Total</div>
                                        <div className='value'>{configData.currencySymbol} {pricingBreakdown.total}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="instruction-details-wrap glass-card">
                                <div className='sub-heading'>Order Instruction</div>
                                <input value={orderInstruction} maxLength={180} placeholder="Add Instruction(Optional)" className="instlab" onChange={(e) => setOrderInstruction(e.target.value)} />
                            </div>


                            <div className="order-btns-wrap">
                                {(configData?.recieveOnlinePayment || configData?.cod) &&
                                    <div className="order-btns clearfix">
                                        {configData?.recieveOnlinePayment && <div className="proceedbtn" onClick={() => proceedOrder('')}>Pay now </div>}
                                        {orderType == 'pickup' && configData?.cod && <div className="proceedbtn" onClick={() => proceedOrder('pay_later')}>Pay at the counter</div>}
                                    </div>}
                            </div>
                        </div>
                        :
                        // CART IS EMPTY
                        <div className="emptyCart-main-wrap">
                            <div className="emptyCart-wrap">
                                <div><img className="cart-logo" src={`/assets/images/${activeGroup}/cart.png`} alt="Respark" /></div>
                                <div className="cart-status">CART IS EMPTY</div>
                                <div className="cart-subtext">You don't have any item in cart</div>
                                <div><button className="cart-button" onClick={handleOrderConfirmationMOdalResponse}>Explore More</button></div>
                            </div>
                        </div>
                    }
                </>
                :
                // Thank you for your purchase
                <div className="emptyCart-main-wrap">
                    <div className="emptyCart-wrap order-confirmation-checkout">
                        <div className="cart-status">{userData.firstName}</div>
                        <div className="cart-subtext">Thank you for your purchase.</div>
                        {orderType == 'pickup' && <div className="cart-subtext">{configData.pickupDisclaimer}</div>}
                    </div>
                    <div className="order-details-wrap ">
                        <div className="heading">Order Details:</div>
                        {orderData?.products?.map((item, index) => {
                            return <div className="item-wrap clearfix" key={Math.random()}>
                                <div className="name">{item.name}({item.quantity})</div>
                                <div className="price">{configData.currencySymbol}{item.billingPrice * item.quantity}</div>
                                {item.variations && item.variations.length !== 0 && <div className="variation-wrap">
                                    <div className="name">{item.variations[0].name}</div>
                                </div>}
                            </div>
                        })}
                        <div className="order-total"><div className="item-wrap clearfix">
                            <div className="name"> Total: </div>
                            <div className="price">{configData.currencySymbol}{orderData?.total}</div>
                        </div>
                        </div>
                        <div className="confirm-btn-wrap book-wrap alignment">
                            <button className="primary-btn" onClick={() => navigateTo('home')}>Explore More</button>
                        </div>
                    </div>
                </div>
            }

            <Backdrop
                className="backdrop-modal-wrapper"
                open={showTotalBreakdownPopup ? true : false}
                onClick={() => setShowTotalBreakdownPopup(false)}
            >
                <div className="backdrop-modal-content"
                    style={{ height: `${showTotalBreakdownPopup ? `${140 + (pricingBreakdown?.appliedTaxes?.length * 30)}px` : '0'}` }}
                >
                    <div className="heading" >Pricing Details</div>
                    <div className="modal-close" onClick={() => setShowTotalBreakdownPopup(false)}>
                        <SvgIcon icon="close" />
                    </div>
                    <div className='pricing-details-wrap d-f-c'>
                        <div className='heading'>
                            <div className='line'>SubTotal</div>
                            {pricingBreakdown.appliedTaxes?.map((taxData: any, i: number) => {
                                return <div className='title' key={Math.random()}>{taxData.name}({taxData.value}%)</div>
                            })}
                            <div className='title grand-total'>Grand Total</div>
                        </div>
                        <div className='details'>
                            <div className='value'>{configData.currencySymbol} {pricingBreakdown.subTotal}</div>
                            {pricingBreakdown.appliedTaxes?.map((taxData: any, i: number) => {
                                return <div className='value' key={Math.random()}>{configData.currencySymbol} {taxData.total}</div>
                            })}
                            <div className='value grand-total'>{configData.currencySymbol} {pricingBreakdown.total}</div>
                        </div>
                    </div>
                </div>
            </Backdrop>

            {openUserUpdationModal && <UserRegistrationModal
                handleResponse={(e) => onUserUpdationClose(e)}
                isApppGrpChangeOnUserGdrChange={true}
                open={true}
                fromPage={'PROFILE'}
                heading={'Update Profile Details'}
            />}
            <ConfirmationModal
                openModal={showOrderingOff}
                title={'Ordering confirmation'}
                message={'Currently we are unserviceable'}
                buttonText={'OK'}
                handleClose={() => setShowOrderingOff(false)}
            />
            <AddressModal
                open={openAddressModal}
                handleClose={(res) => handleAddressModalResponse(res)}
                addressToEdit={selectedAddressToEdit}
                userId={userData?.id}
            />
        </div>
    )
}

export default CheckoutPage

import { showError, showSuccess } from '@context/actions/alert';
import { replaceAppointmentServices, syncLocalStorageAppointment } from '@context/actions/appointment';
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { SERVICE } from '@constant/types';
import Item from '@element/horizontalItem';
import { getStaffByTenantId } from '@storeData/staff';
import ConfirmationModal from '@module/confirmationModal';
import { useCookies } from "react-cookie";
import { APISERVICE } from '@util/apiService/RestClient';
import { disableLoader, enableLoader, updateStore, updateWhatsappTemplates } from '@context/actions';
import router from 'next/router';
import UserRegistrationModal from '@module/userRegistration';
import { windowRef } from '@util/window';
import { APPOINTMENT_CREATED, APPOINTMENT_TYPE } from '@constant/appointment';
import { createSlots, getUpcommingDates } from '@util/utils';
import Backdrop from '@material-ui/core/Backdrop';
import { markUserOptInForWhatsapp, updateUser } from '@storeData/user';
import { markStoreOptInForWhatsapp } from '@storeData/store';
import { getAllTemplates, markUserOptIn, sendWhatsappMsgMessage } from '@storeData/whatsapp';
import { QUOTE_REQUEST_TO_OWNER, QUOTE_REQUEST_TO_USER } from '@constant/whatsappTemplates';
import SvgIcon from '@element/svgIcon';
import { navigateTo } from '@util/routerService';

function IoMdSearch(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 512 512" height="1em" width="1em" {...props}><path d="M337.509 305.372h-17.501l-6.571-5.486c20.791-25.232 33.922-57.054 33.922-93.257C347.358 127.632 283.896 64 205.135 64 127.452 64 64 127.632 64 206.629s63.452 142.628 142.225 142.628c35.011 0 67.831-13.167 92.991-34.008l6.561 5.487v17.551L415.18 448 448 415.086 337.509 305.372zm-131.284 0c-54.702 0-98.463-43.887-98.463-98.743 0-54.858 43.761-98.742 98.463-98.742 54.7 0 98.462 43.884 98.462 98.742 0 54.856-43.762 98.743-98.462 98.743z" /></svg>;
}

function MdClear(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>;
}

function Appointment() {
    const [cookie, setCookie] = useCookies();
    const [userData, setUserCookie] = useState(cookie['user']);
    const store = useSelector(state => state);
    const dispatch = useDispatch();
    const [itemToSearch, setitemToSearch] = useState('');
    const [expertQuery, setExpertQuery] = useState('');
    const [memberQuery, setmemberQuery] = useState('');
    const baseRouteUrl = useSelector(state => state.store.baseRouteUrl);
    const appointmentItems = useSelector(state => state.appointmentServices);
    const storeData = useSelector(state => state.store ? state.store.storeData : null);
    const [storeSlot, setStoreSlot] = useState(createSlots(storeData.configData?.startTime, storeData.configData?.closureTime));
    const [filteredList, setfilteredList] = useState<any>();
    const [expertData, setexpertData] = useState(null);
    const [allExpertsList, setAllExpertsList] = useState<any>([])
    const [selectedExpert, setSelectedExpert] = useState<any>();
    const availableDates = getUpcommingDates(15, storeData.configData);
    const [selectedMember, setSelectedMember] = useState<any>();
    const [selectedDate, setSelectedDate] = useState<any>(availableDates[0]);
    const [selectedSlot, setSelectedSlot] = useState<any>('');
    const [showAppointmentConfirmation, setShowAppointmentConfirmation] = useState(false);
    const [appointmentInstruction, setAppointmentInstruction] = useState('');
    const [appointmentOrder, setAppointmentOrder] = useState<any>();
    const [showAppointmentSuccess, setShowAppointmentSuccess] = useState(false);
    const [showUserRegistration, setShowUserRegistration] = useState(false);
    const [activeInput, setActiveInput] = useState('');
    const [appointmentObj, setAppointmentObj] = useState<any>('');
    const [showTotalBreakdownPopup, setShowTotalBreakdownPopup] = useState(false);
    const { configData, keywords } = useSelector(state => state.store ? state.store.storeData : null);
    const { gupshupConfig } = configData?.storeConfig;
    const [familyMember, setFamilyMember] = useState<any>({ name: '', mobileNo: '' });
    const [showAddMemberModal, setShowAddMemberModal] = useState(false)
    const [error, seterror] = useState('');
    const itemSearchRef = useRef<HTMLInputElement>(null);
    const [selectedStoreLocation, setSelectedStoreLocation] = useState('');
    const [categoriesList, setCategoriesList] = useState<any[]>([]);
    const storeMetaData = useSelector(state => state.store ? state.store.storeMetaData : null);
    const whatsappTemplates = store.whatsappTemplates;

    useEffect(() => {
        if (windowRef) {
            dispatch(syncLocalStorageAppointment());
            window.scrollTo(0, 0);
        }
        getStaffByTenantId(storeData.tenantId)
            .then((expert: any) => {
                if (expert) {
                    setAllExpertsList(expert.filter((e: any) => e.active))
                    setexpertData(expert.filter((e: any) => e.active));
                }
            })
            .catch((e) => {
                dispatch(showError(e.error));
            })
    }, [windowRef])

    useEffect(() => {
        setUserCookie(cookie['user']);
    }, [cookie])

    useEffect(() => {
        if (windowRef && (showTotalBreakdownPopup || showAppointmentConfirmation)) {
            document.body.classList.add("o-h")
        } else {
            document.body.classList.remove("o-h")
        }
        return () => {
            document.body.classList.remove("o-h")
        }

    }, [windowRef, showTotalBreakdownPopup, showAppointmentConfirmation]);

    useEffect(() => {
        console.log(configData.storeConfig.storeLocations)
    }, [configData])


    useEffect(() => {
        if (allExpertsList.length != 0 && appointmentItems.length != 0) {
            let availableStaff = [];
            appointmentItems.map((service: any, i: number) => {
                if (service.experts) {
                    service.experts.map((expert: any) => {
                        let alreadyAdded = availableStaff.length != 0 ? availableStaff.filter((s) => s.id == expert.id) : [];
                        if (alreadyAdded.length == 0) {
                            let staffs = allExpertsList.filter((s) => s.id == expert.id);
                            staffs.length != 0 && availableStaff.push(staffs[0])
                        }
                    })
                }
            })
            let selectedExpertAvl = availableStaff.length != 0 ? availableStaff.filter((s) => s.id == selectedExpert?.id) : [];
            if (selectedExpertAvl.length == 0) setSelectedExpert(null)
            if (availableStaff.length != 0) setexpertData(availableStaff);
            else setexpertData(null);
        } else setexpertData(null);
    }, [allExpertsList, appointmentItems])

    useEffect(() => {
        if (appointmentItems.length != 0) {
            const appointmentCopy = { ...appointmentItems }
            let appliedTaxes: any[] = [];
            let subTotal = 0;
            let total = 0;
            appointmentItems.map((service: any, i: number) => {

                // her  variation price not considered because at the time of appointment booking it is set inside service object as price and salePrice
                let applicablePrice: any = parseFloat(service.salePrice) || parseFloat(service.price);
                subTotal += parseFloat(applicablePrice);
                total += parseFloat(applicablePrice);

                if (service.txchrgs) {
                    service.txchrgs.map((taxData: any) => {
                        //update global total
                        total = Number((Number(total) + Number(taxData.value)).toFixed(2));
                        //update global applied taxes total
                        let isAVl = appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                        if (isAVl != -1) {
                            appliedTaxes[isAVl].total = Number((appliedTaxes[isAVl].total + Number(taxData.value.toFixed(2)).toFixed(2)));
                        } else {
                            appliedTaxes.push({ name: taxData.name, value: ((100 * taxData.value) / applicablePrice).toFixed(1), total: taxData.value })
                        }
                    })
                }
                if (i == appointmentItems.length - 1) {
                    appointmentCopy.total = total.toFixed();
                    appointmentCopy.subTotal = subTotal.toFixed();
                    appointmentCopy.txchrgs = appliedTaxes;
                    if (appointmentCopy.total != appointmentObj.total) {//check for total beacause of stopping rerendering on setting appointment
                        setAppointmentObj(appointmentCopy);
                    }
                    // console.log("appointmentCopy", appointmentCopy)
                }
            })
        } else {
            setAppointmentObj({ total: 0, subTotal: 0 });
        }
        setActiveInput('');
        setitemToSearch('');
    }, [appointmentItems]);

    useEffect(() => {
        if (storeSlot.length != 0) {
            const month = (new Date().getMonth() + 1).toString().length == 1 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1;
            const date = new Date().getDate().toString().length == 1 ? `0${new Date().getDate()}` : new Date().getDate();
            const todaysDateObj = `${new Date().getFullYear()}-${month}-${date}`
            if (todaysDateObj == selectedDate.dateObj) {// check for todays date create slot after current time
                let hrs = ((new Date().getHours().toString().length == 1) ? '0' + new Date().getHours() : new Date().getHours());
                let mins = ((new Date().getMinutes().toString().length == 1) ? '0' + new Date().getMinutes() : new Date().getMinutes());
                if (mins < 30) mins = '30';//for 00:27 set min to 30
                if (mins > 30) mins = '00';//for 00:37 set min to 00
                const startTime = hrs + ':' + mins;
                setStoreSlot(createSlots(startTime, configData?.closureTime))
            } else {
                setStoreSlot(createSlots(configData?.startTime, configData?.closureTime))
            }
        }
    }, [selectedDate]);

    const removeService = (index) => {
        const appointmentCopy = [...appointmentItems];
        appointmentCopy.splice(index, 1);
        dispatch(replaceAppointmentServices(appointmentCopy));
        dispatch(showSuccess('Service Removed', 2000));
    }

    const onClickServiceInput = () => {
        if (activeInput != keywords[SERVICE]) {
            itemSearchRef.current.focus();
            searchItems('')
        }
        setActiveInput(activeInput == keywords[SERVICE] ? '' : keywords[SERVICE]);
        setitemToSearch('')
    }

    const onSelectExpert = (expert) => {
        setSelectedExpert({ ...expert });
        setActiveInput('');
    }
    const onSelectMember = (member) => {
        setSelectedMember({ ...member });
        setActiveInput('');
    }

    const onSelectDate = (date) => {
        setActiveInput('');
        setSelectedDate(date);
    }
    const onSelectSlot = (slot) => {
        setActiveInput('');
        setSelectedSlot(slot);
    }

    const onLoginClose = (user) => {
        if (user) {
            onConfirmBookingClick(user);
        }
        setShowUserRegistration(false);
    }

    const onAppointmentConfirmation = () => {
        if (userData) submitAppointment(userData);
        else setShowUserRegistration(true);
    }

    const getServiceDuration = (duration, durationType) => {
        if (durationType.includes('hrs')) {
            return (parseFloat(duration) * 60).toFixed(1);
        } else return parseFloat(duration);
    }

    const createIndividualExpertService = (serviceDetails: any) => {
        const { id, name, duration, durationType, categoryName, price, quantity, salePrice, serviceCategoryId, serviceId, txchrgs, variations } = serviceDetails;
        const individualAppointmentObj = {
            "appointmentDay": selectedDate.dateObj,
            "appointmentTime": selectedSlot,
            "duration": getServiceDuration(duration, durationType),
            "serviceCategory": categoryName,
            "service": name,
            "slot": '',
            "expertId": selectedExpert?.id,
            "expertName": selectedExpert ? (selectedExpert.lastName ? `${selectedExpert.firstName} ${selectedExpert.lastName}` : selectedExpert.firstName) : '',
            "price": price,
            "quantity": quantity || 1,
            "salePrice": salePrice,
            "serviceCategoryId": serviceCategoryId,
            "serviceId": id,
            "txchrgs": txchrgs,
            "variations": variations,
        }
        return individualAppointmentObj;
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
        let itemmsg = `${appointmentItems[0].categoryName} - ${appointmentItems[0].name}`;
        if (appointmentItems.length != 1) {
            itemmsg = '';
            appointmentItems.map((item: any, i: number) => {
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

    const submitAppointment = (user) => {
        setShowAppointmentConfirmation(false);
        if (user) {
            dispatch(enableLoader());
            const appointmentsList = [];
            appointmentItems.map((item) => {
                appointmentsList.push(createIndividualExpertService(item));
            })
            appointmentsList[0].slot = selectedSlot;
            let familyMember = null;
            if (selectedMember) {
                familyMember = selectedMember.mobileNo != userData.mobileNo ? selectedMember : null;
            }
            const appointmentObj = {
                "appointmentDay": appointmentsList[0].appointmentDay,
                "appointmentTime": appointmentsList[0].appointmentTime,
                "duration": appointmentsList[0].duration,
                "instruction": appointmentInstruction,
                "slot": appointmentsList[0].slot,
                "expertId": appointmentsList[0].expertId,
                "expertName": appointmentsList[0].expertName,
                "storeId": storeData.storeId,
                "tenantId": storeData.tenantId,
                "store": storeData.store,
                "tenant": storeData.tenant,
                "guestId": user.id,
                "guestName": user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName,
                "guestMobile": user.mobileNo,
                "guestEmail": user.email,
                "createdOn": new Date().toISOString(),
                "expertAppointments": appointmentsList,
                "noOfRemindersSent": '',
                "rescheduled": false,
                "feedbackLinkShared": false,
                "bookedFor": familyMember,
                "storeLocation": selectedStoreLocation,
                "type": APPOINTMENT_TYPE,
                "status": [{
                    "status": APPOINTMENT_CREATED,
                    "staff": "",
                    "createdOn": new Date().toISOString()
                }]
            }

            console.log(appointmentObj);
            APISERVICE.POST(process.env.NEXT_PUBLIC_PLACE_APPOINTMENT, appointmentObj).then((res) => {
                setTimeout(() => {
                    // sendWhatsappMsg(user)
                    setAppointmentOrder(res.data)
                    setShowAppointmentSuccess(true);
                    dispatch(disableLoader());
                    dispatch(replaceAppointmentServices([]));
                    dispatch(showSuccess('Appointment booked successfully'))
                }, 1000)
            }).catch((error) => {
                console.log(error);
                dispatch(disableLoader());
                dispatch(showError('Appointment booking failed'))
            })
        }
    }

    const onConfirmBookingClick = (user) => {
        if (!appointmentItems || appointmentItems.length == 0) {
            dispatch(showError('Select any service'));
        } else if (!selectedDate) {
            dispatch(showError('Select preferred date'));
        } else if (!selectedExpert && configData?.storeConfig?.appointmentConfig?.showExpertAsSalon) {
            dispatch(showError('Select salon location'));
        } else if (!selectedStoreLocation && configData?.storeConfig?.storeLocations && configData?.storeConfig?.storeLocations?.length != 0) {
            dispatch(showError('Select store location'));
        } else if (!selectedSlot) {
            dispatch(showError('Select preferred slot'));
        } else {
            if (user) {
                setSelectedMember({ name: user?.firstName, mobileNo: user?.mobileNo });
                setShowAppointmentConfirmation(true);
            } else setShowUserRegistration(true);
        }
    }
    const onClickExpertInput = () => {
        searchItems('');
        setActiveInput(activeInput == 'expert' ? '' : 'expert');
    }

    const onClickStoreLocationInput = () => {
        searchItems('');
        setActiveInput(activeInput == 'store-location' ? '' : 'store-location');
    }

    const onChangeMemberValue = (from, value) => {
        seterror('')
        const familyMemberCopy = { ...familyMember };
        if (from == 'mobileNo') {
            if (value && value.length > 10) {
                setFamilyMember(familyMemberCopy)
            } else {
                familyMemberCopy[from] = value;
                setFamilyMember(familyMemberCopy)
            }
        } else {
            familyMemberCopy[from] = value;
            setFamilyMember(familyMemberCopy)
        }
    }

    const closeMemberForm = () => {
        setFamilyMember({ name: '', mobileNo: '' });
        setShowAddMemberModal(false)
    }

    const submitMemberForm = () => {
        if (!familyMember.name) {
            seterror('member-name')
        } else if (!familyMember.mobileNo) {
            seterror('member-mobileNo')
        } else {
            const userDataCopy = { ...userData }
            if (userDataCopy.familyMembers) userDataCopy.familyMembers.push(familyMember)
            else userDataCopy.familyMembers = [familyMember];
            dispatch(enableLoader());
            updateUser(userDataCopy)
                .then((res: any) => {
                    dispatch(disableLoader());
                    dispatch(showSuccess('Member Added', 2000));
                    setCookie("user", res.data, { //user registration fields
                        path: "/",
                        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        sameSite: true,
                    })
                    setSelectedMember({ ...familyMember })
                }).catch((error) => {
                    dispatch(disableLoader());
                    dispatch(showError('Something went wrong. please try again ', 2000));
                })
            setShowAddMemberModal(false);
            setFamilyMember({ name: '', mobileNo: '' });
            setActiveInput('');
        }
    }


    const filterCategory = async (category: any, searchQuery: any) => {
        return new Promise((res, rej) => {
            if (category.showOnUi) {
                category.display = false;
                if (category.name.toLowerCase().includes(searchQuery)) {
                    category.display = true;
                }
                if (category?.categoryList && category?.categoryList?.length != 0) {
                    category.categoryList?.map(async (subcat: any) => {
                        if (subcat.showOnUi) {
                            subcat = await filterCategory(subcat, category.display ? '' : searchQuery)
                        } else subcat.display = false;
                    })
                    let isAnyDisplaySubcat = category?.categoryList?.filter((cat: any) => cat.display);
                    category.display = isAnyDisplaySubcat?.length != 0 ? true : false;
                } else if (category?.itemList?.length != 0) {//3rd level itemslist
                    let filteredItems = category?.itemList;
                    if (searchQuery) filteredItems = category?.itemList.filter((item: any) => item.showOnUi && item.name.toLowerCase().includes(category.display ? '' : searchQuery));
                    filteredItems.map((item: any) => {
                        item.serviceId = item.id;
                        item.duration = (item.durationType.includes('hrs')) ? (parseFloat(item.duration) * 60).toFixed(1) : parseFloat(item.duration);
                    })
                    category.itemList = filteredItems;
                    category.display = filteredItems.length != 0 ? true : false;
                } else category.display = false;
            } else category.display = false;
            res(category);
        })
    }

    const searchItems = async (searchQuery: any) => {
        searchQuery = searchQuery ? searchQuery.toLowerCase() : '';
        const { categories } = JSON.parse(JSON.stringify(storeData));
        const categoriesCopy = categories.filter((c: any) => c.type == keywords[SERVICE] && c.active);
        categoriesCopy.map(async (catData: any) => {//1st level category
            catData = await filterCategory(catData, searchQuery)
        })
        setCategoriesList(JSON.parse(JSON.stringify(categoriesCopy)));
        setitemToSearch(searchQuery);
    }

    const renderCategoryItemsView = (category: any) => {
        if (category && category.display) {
            return <div className={`items-cat-wrap clearfix ${(category?.categoryList && category?.categoryList.length != 0) ? 'has-sub-category' : ''}`}>
                <div className={`cat-name ${(category?.categoryList && category?.categoryList.length != 0) ? 'has-sub-category' : ''}`}>
                    {category.name}
                </div>
                {((category?.categoryList && category?.categoryList.length != 0) && category?.categoryList?.length != 0) ? <>
                    {category?.categoryList?.map((category: any) => {
                        return <React.Fragment key={category.id}>
                            {renderCategoryItemsView(category)}
                        </React.Fragment>
                    })}
                </> : <>
                    {(category?.itemList && category?.itemList?.length != 0) ? <>
                        {renderItems(category.itemList)}
                    </> : <></>}
                </>}
            </div>

        } else return null;
    }

    const renderItems = (itemsList: any) => {
        if (itemsList && itemsList?.length != 0) {
            return <React.Fragment>
                {itemsList?.map((item: any, itemIndex: number) => {
                    return <React.Fragment key={Math.random()}>
                        <Item item={item} config={{ redirection: false, onClickAction: true }} />
                    </React.Fragment>
                })}
            </React.Fragment>
        } else return null;
    }

    const redirectToCategories = () => {
        let activeCats = storeData.categories.filter((c: any) => c.active && c.type == keywords[SERVICE]);
        let itemUrl = activeCats[0].name.toLowerCase().split(" ").join("-");
        navigateTo(`${itemUrl}-srp`);
    }

    return (

        <>
            {!showAppointmentSuccess ?
                <div className="main-wrapper appointment-wrap">
                    {/* <div className="backwrap">
                        <div className=" backwrap-content">
                            <span onClick={() =>  navigateTo('home')}><SvgIcon icon="backArrow" shape='circle' height={30} width={30} /></span>
                            <span>Appointment</span>
                        </div>

                    </div> */}
                    {userData && <div className="card">
                        <div className="sub-heading">User Details</div>
                        <div className="username">{userData.firstName} {userData.lastName}
                        </div>
                        <div className="usernumber">{userData.mobileNo}</div>
                        <div className="usernumber">{userData.email}</div>

                    </div>}
                    <div className="selected-service-list-wrap card clearfix">
                        <div className="sub-heading">Selected Services</div>
                        {/* <div className="input-wrap input-wrp">
                            <input className="inputbox"
                                value={itemToSearch || ''}
                                onChange={(e) => searchItems(e.target.value)}
                                placeholder="Search service"
                                onClick={onClickServiceInput}
                            />
                            {!itemToSearch && <div className="input-icon"><IoMdSearch /></div>}
                            {itemToSearch && <div className="input-icon" onClick={() => searchItems('')} ><MdClear /></div>}
                            <Backdrop
                                className="backdrop-modal-wrapper"
                                open={activeInput == keywords[SERVICE] ? true : false}
                            >
                                <div className="backdrop-modal-content"
                                    style={{ height: `${activeInput == keywords[SERVICE] ? 'calc(100vh - 60px)' : '0'}` }}
                                >
                                    <div className="heading" >Add services</div>
                                    <div className="modal-close" onClick={onClickServiceInput}>
                                        <SvgIcon icon="close" />
                                    </div>
                                    <div className='service-search-input-wrap'>
                                        <input className="inputbox"
                                            value={itemToSearch || ''}
                                            ref={itemSearchRef}
                                            id="search-service"
                                            onChange={(e) => searchItems(e.target.value)}
                                            placeholder="Search service"
                                        />
                                        {!itemToSearch && <div className="input-icon"><IoMdSearch /></div>}
                                        {itemToSearch && <div className="input-icon" onClick={() => searchItems('')} ><MdClear /></div>}
                                    </div>
                                    {categoriesList.length != 0 && <div className="add-services-wrap">
                                        {categoriesList.map((category: any, i: number) => {
                                            return <React.Fragment key={Math.random()}>{renderCategoryItemsView(category)}</React.Fragment>
                                        })}
                                    </div>}
                                    {(categoriesList.length == 0 && itemToSearch) && <div className="not-found">Service not found</div>}
                                </div>
                            </Backdrop>
                        </div> */}
                        {appointmentItems?.length != 0 && appointmentItems?.map((item, index) => {
                            return <div key={Math.random()} className="service-wrap">
                                <div className='service-details'>
                                    <div className='service-name'>{item.name} </div>
                                    {item.variations && item.variations.length != 0 && <div className='variations-wrap'>
                                        ({item.variations[0].name}
                                        {item.variations[0]?.variations?.length != 0 && <>-{item.variations[0]?.variations[0]?.name}</>}
                                        {item.variations[0]?.variations?.length != 0 && item.variations[0]?.variations[0]?.variations?.length != 0 && <>-{item.variations[0]?.variations[0]?.variations[0]?.name}</>})
                                    </div>}
                                </div>
                                <div className="service-cancel-icon" onClick={() => removeService(index)} >
                                    <SvgIcon icon="close" />
                                </div>
                            </div>
                        })}
                        <div className="btn-wrap fullwidth">
                            <div className='btn' onClick={redirectToCategories}>Add more services</div>
                        </div>
                    </div>

                    {expertData && <div className="input-wrap expert-list card">
                        {configData?.storeConfig.appointmentConfig?.showExpertAsSalon ? <div className="sub-heading">Salon</div> : <div className="sub-heading">Expert</div>}
                        {selectedExpert ? <div className="selected-service-list-wrap">
                            <div className="service-wrap">
                                <div className='service-details' onClick={onClickExpertInput}>
                                    <div className='service-name'>{selectedExpert?.firstName} {selectedExpert?.lastName} </div>
                                </div>
                                <div className="service-cancel-icon" onClick={() => { setSelectedExpert(null); onClickExpertInput() }}>
                                    <SvgIcon icon="close" />
                                </div>
                            </div>
                        </div> :
                            <>
                                <input className="inputbox" value={''}
                                    placeholder={`${selectedExpert ? `${selectedExpert?.firstName} ${selectedExpert?.lastName}` : configData.storeConfig?.appointmentConfig?.showExpertAsSalon ? 'Select salon location' : 'Select Expert'}`}
                                    readOnly onClick={onClickExpertInput} />
                                <span className={activeInput == 'expert' ? "input-icon active" : "input-icon"} onClick={onClickExpertInput}><SvgIcon icon="backArrow" /></span>
                            </>
                        }

                        <div className="searched-item-list-wrap"
                            style={{ height: activeInput == 'expert' ? `${expertData ? (expertData.length + 1) * 30 : 0}px` : '0' }} onClick={() => expertQuery ? {} : ''} >

                            <div className="items-list">
                                {expertData?.map((expert, i) => {
                                    return <React.Fragment key={Math.random()}>
                                        {!!expert.active && <div className="expert-details" onClick={() => onSelectExpert(expert)}>
                                            <div className="expert-name">{expert.firstName} {expert.lastName}</div>
                                        </div>}
                                    </React.Fragment>
                                })}
                            </div>
                        </div>
                    </div>}


                    {(configData?.storeConfig?.storeLocations && configData?.storeConfig?.storeLocations?.length != 0) && <div className="input-wrap expert-list card">
                        <div className="sub-heading">Location</div>
                        {selectedStoreLocation ? <div className="selected-service-list-wrap">
                            <div className="service-wrap">
                                <div className='service-details' onClick={onClickStoreLocationInput}>
                                    <div className='service-name'>{selectedStoreLocation} </div>
                                </div>
                                <div className="service-cancel-icon" onClick={() => { setSelectedStoreLocation(''); onClickStoreLocationInput() }}>
                                    <SvgIcon icon="close" />
                                </div>
                            </div>
                        </div> :
                            <>
                                <input className="inputbox" value={''}
                                    readOnly
                                    placeholder={`${selectedStoreLocation ? `${selectedStoreLocation}` : 'Select store location'}`}
                                    onClick={onClickStoreLocationInput} />
                                <div className={activeInput == 'store-location' ? "input-icon active" : "input-icon"} onClick={onClickStoreLocationInput} ><SvgIcon icon="backArrow" /></div>
                            </>
                        }

                        <div className="searched-item-list-wrap"
                            style={{ height: activeInput == 'store-location' ? `${configData?.storeConfig?.storeLocations ? (configData?.storeConfig?.storeLocations.length + 1) * 30 : 0}px` : '0' }}>

                            <div className="items-list">
                                {configData?.storeConfig?.storeLocations?.map((store, i) => {
                                    return <React.Fragment key={Math.random()}>
                                        <div className="expert-details" onClick={() => { setSelectedStoreLocation(store.name); setActiveInput('') }}>
                                            <div className="expert-name">{store.name}</div>
                                        </div>
                                    </React.Fragment>
                                })}
                            </div>
                        </div>
                    </div>}



                    <div className="date-wrap card">
                        <div className="sub-heading">Preferred Date</div>
                        {availableDates.map((date, index) => {
                            return <div key={Math.random()} className={selectedDate?.dateObj == date.dateObj ? 'slot-wrap active' : "slot-wrap"} onClick={() => onSelectDate(date)}>
                                <div>{date.displayDate}</div>
                                <div>{date.displayDay}</div>
                            </div>
                        })}
                    </div>

                    <div className="slot-time-outer card">
                        <div className="sub-heading">Preferred Time</div>
                        {configData && storeSlot.map((storeSlot, index) => {
                            return <div key={Math.random()} onClick={() => onSelectSlot(storeSlot)} className={selectedSlot == storeSlot ? 'slot-wrap active' : "slot-wrap"}>{storeSlot}</div>

                        })}
                    </div>

                    <div className="input-wrap card">
                        <div className="sub-heading">Instruction</div>
                        <textarea className="inputbox" placeholder="Note" value={appointmentInstruction || ''} onChange={(e) => setAppointmentInstruction(e.target.value)} />
                    </div>

                    {!(!appointmentObj.total) && <div className="book-wrap">
                        <div className='total-wrap d-f-c'>
                            <div className='title'>Total : </div>
                            <div className='value' onClick={() => setShowTotalBreakdownPopup(true)}>{configData.currencySymbol} {appointmentObj.total}</div>
                            <div className='info d-f-c' onClick={() => setShowTotalBreakdownPopup(true)}><SvgIcon icon="info" /></div>
                        </div>
                        <button className="primary-btn rounded-btn" onClick={() => onConfirmBookingClick(userData)}>Confirm Booking</button>
                    </div>}

                    <Backdrop
                        className="backdrop-modal-wrapper  appointment-checkout-wrapper"
                        open={showAppointmentConfirmation ? true : false}
                        title={'Appointment confirmation'}

                    >

                        <div className="backdrop-modal-content" style={{ height: `${showAppointmentConfirmation ? '580px' : '0'}` }}>
                            <div className="modal-close" onClick={() => setShowAppointmentConfirmation(false)}>
                                <SvgIcon icon="close" />
                            </div>
                            <div className='appointment-checkout-content'>
                                <div className="heading">Appointment details</div>
                                <div className="date-time card">
                                    <div className='sub-heading'>Date & Time</div>
                                    <div className="date">{selectedDate?.dateObj?.split("-")?.reverse()?.join("-")}, {selectedSlot}</div>
                                </div>
                                <div className="services-list-wrap card">
                                    <div className="sub-heading">Services</div>
                                    {appointmentItems?.map((item, i) => {
                                        return <div className="service-name" key={Math.random()}>{item.name}</div>
                                    })}
                                </div>
                                {selectedExpert && <div className="services-list-wrap card">
                                    {configData.storeConfig?.appointmentConfig?.showExpertAsSalon ? <div className="sub-heading">Salon</div> : <div className="sub-heading">Expert</div>}
                                    <div className="service-name">{selectedExpert?.firstName} {selectedExpert?.lastName}</div>
                                </div>}

                                <div className="appt-for-wrap card">
                                    <div className="sub-heading">Appointment For</div>
                                    <div className='selected-profile'>
                                        <div className='name'>{selectedMember?.name}, {selectedMember?.mobileNo}</div>
                                    </div>
                                    <div className='profile-list'>
                                        <div className={`profile ${selectedMember?.name == userData?.firstName ? 'active' : ''}`} onClick={() => onSelectMember({ name: userData?.firstName, mobileNo: userData?.mobileNo })}  >Self</div>
                                        {userData?.familyMembers?.map((member, i) => {
                                            return <div key={Math.random()} onClick={() => onSelectMember(member)} className={`profile ${selectedMember?.name == member.name ? 'active' : ''}`}>{member.name}</div>
                                        })}
                                    </div>
                                    <div className='add-profile'>
                                        <div onClick={() => { setShowAddMemberModal(true); setActiveInput('') }} >Add Member +</div>
                                    </div>
                                </div>

                                <Backdrop
                                    className="backdrop-modal-wrapper"
                                    open={showAddMemberModal ? true : false}
                                >
                                    <div className="backdrop-modal-content"
                                        style={{ height: showAddMemberModal ? '250px' : '0px' }}
                                    >
                                        <div className="modal-close" onClick={closeMemberForm}>
                                            <SvgIcon icon="close" />
                                        </div>
                                        <div className="member-modal">
                                            <div className='heading'>Add Member</div>
                                            <div className="member-form">
                                                <div className='input-wrap'>
                                                    <span className="label">Name*</span>
                                                    <input className={error == 'member-name' ? 'input error' : 'input'}
                                                        autoComplete="off"
                                                        placeholder='Profile name'
                                                        value={familyMember.name || ''}
                                                        onChange={(e) => onChangeMemberValue('name', e.target.value)} />
                                                    {error == 'member-name' && <div className="error">Please enter name</div>}
                                                </div>
                                                <div className='input-wrap'>
                                                    <span className="label">mobileNo*</span>
                                                    <input className={error == 'member-mobileNo' ? 'input error' : 'input'}
                                                        autoComplete="off"
                                                        placeholder='Profile number'
                                                        minLength={10}
                                                        maxLength={10}
                                                        type="number"
                                                        value={familyMember.mobileNo || ''}
                                                        onChange={(e) => onChangeMemberValue('mobileNo', e.target.value)} />
                                                    {error == 'member-mobileNo' && <div className="error">Please enter phone number</div>}
                                                </div>
                                            </div>
                                            <div className="form-btn-wrap">
                                                <button className="primary-btn rounded-btn border-btn without-border-btn" onClick={closeMemberForm}>Cancel</button>
                                                <button className="primary-btn rounded-btn" onClick={submitMemberForm}>Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </Backdrop>
                                <div className='confirm-btn-wrap'>
                                    <button className="primary-btn rounded-btn" onClick={onAppointmentConfirmation}>Confirm</button>
                                </div>
                            </div>
                        </div>
                    </Backdrop>

                    {showUserRegistration && <UserRegistrationModal
                        handleResponse={(e) => onLoginClose(e)}
                        isApppGrpChangeOnUserGdrChange={true}
                        open={true}
                        fromPage={'APPOINTMENT'}
                        heading={'Login for appointment booking'}
                    />}

                    <Backdrop
                        className="backdrop-modal-wrapper"
                        open={showTotalBreakdownPopup ? true : false}
                        onClick={() => setShowTotalBreakdownPopup(false)}
                    >
                        <div className="backdrop-modal-content"
                            style={{ height: `${showTotalBreakdownPopup ? `${140 + (appointmentObj?.txchrgs?.length * 30)}px` : '0'}` }}
                        >
                            <div className="heading" >Pricing Details</div>
                            <div className="modal-close" onClick={() => setShowTotalBreakdownPopup(false)}>
                                <SvgIcon icon="close" />
                            </div>
                            <div className='pricing-details-wrap d-f-c'>
                                <div className='heading'>
                                    <div className='title'>SubTotal</div>
                                    {appointmentObj.txchrgs?.map((taxData: any, i: number) => {
                                        return <div className='title' key={Math.random()}>{taxData.name}({taxData.value}%)</div>
                                    })}
                                    <div className='title grand-total'>Grand Total</div>
                                </div>
                                <div className='details'>
                                    <div className='value'>{configData.currencySymbol} {appointmentObj.subTotal}</div>
                                    {appointmentObj.txchrgs?.map((taxData: any, i: number) => {
                                        return <div className='value' key={Math.random()}>{configData.currencySymbol} {taxData.total}</div>
                                    })}
                                    <div className='value grand-total'>{configData.currencySymbol} {appointmentObj.total}</div>
                                </div>
                            </div>
                        </div>
                    </Backdrop>
                </div >
                : <>
                    {appointmentOrder && <div className="main-wrapper appointment-wrap" style={{ background: 'transparent' }}>
                        <div className='appointment-checkout-content'>
                            <div className="username instruction">Hi {userData?.firstName} your appointment has been initiated for the below services.</div>
                            <div className="date-time card">
                                <div className='sub-heading'>Date & Time</div>
                                <div className="date">{selectedDate?.dateObj?.split("-")?.reverse()?.join("-")}, {selectedSlot}</div>
                            </div>
                            {appointmentOrder.expertAppointments.length != 0 && <div className="services-list-wrap card">
                                <div className="sub-heading">Services</div>
                                {appointmentOrder.expertAppointments?.map((item, i) => {
                                    return <div className="service-name" key={Math.random()}>{item.service}</div>
                                })}
                            </div>}
                            {selectedExpert && <div className="services-list-wrap card">
                                {configData.storeConfig?.appointmentConfig?.showExpertAsSalon ? <div className="sub-heading">Salon</div> : <div className="sub-heading">Expert</div>}
                                <div className="service-name">{selectedExpert?.firstName} {selectedExpert?.lastName}</div>
                            </div>}

                            <div className="appt-for-wrap card">
                                <div className="sub-heading">Appointment For</div>
                                <div className='selected-profile'>
                                    <div className='name'>{selectedMember?.name}, {selectedMember?.mobileNo}</div>
                                </div>
                            </div>
                            <div className="username instruction">** we will revert with the confirmation of your appointment.</div>

                            <div className='confirm-btn-wrap book-wrap alignment'>
                                <button className="primary-btn rounded-btn" onClick={() => navigateTo('home')}>Explore More</button>
                            </div>
                        </div>
                    </div>}
                </>
            }
        </>
    )
}

export default Appointment


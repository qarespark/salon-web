import { APISERVICE } from "@api/RestClient";

export const updateUser = (userDetails) => {
    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_REGISTER_USER}`, userDetails)
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_UPDATE_ADDRESS}=>`, error);
            });
    })
}

export const updateUserAddress = (address, userId) => {
    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_UPDATE_ADDRESS}/${userId}`, address)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_UPDATE_ADDRESS}/${userId}=>`, error);
            });
    })
}

export const getUserByTenantAndMobile = (tenantId, storeId, mobile) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GET_USER}/userbymobile/${tenantId}/${storeId}/${mobile}`)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_UPDATE_ADDRESS}/${tenantId}/${mobile}=>`, error);
            });
    })
}

export const getUserByTenantAndEmail = (tenantId, storeId, mobile) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GET_USER}/userbyemail/${tenantId}/${storeId}/${mobile}`)
            .then((response: any) => {
                if (response && response?.data?.length != 0) {
                    res(response.data[0]);
                } else {
                    rej('');
                    console.log("User not found");
                }
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_GET_USER}/${tenantId}/${mobile}=>`, error);
            });
    })
}

export const markUserOptInForWhatsapp = (tenantId, storeId, usersList) => {
    return new Promise((res, rej) => {
        APISERVICE.PUT(`${process.env.NEXT_PUBLIC_UPDATE_OPTIN_FOR_WAPP}/${tenantId}/${storeId}`, usersList)
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_UPDATE_ADDRESS}=>`, error);
            });
    })
}

export const updateUserVisitCount = (userId) => {
    return new Promise((res, rej) => {
        APISERVICE.PUT(`${process.env.NEXT_PUBLIC_UPDATE_VISIT_COUNT}/${userId}`, {})
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_UPDATE_ADDRESS}=>`, error);
            });
    })
}
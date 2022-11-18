import React, { useEffect } from 'react'
import { windowRef } from '@util/window';

function Terms() {
    return (
        <div className="privacy-wrap">
            <h3 className="title glass-card">Terms and conditions</h3>
            <div className="glass-card">
                1. Description of Service
                Respark provides software as a web service, also referred to as cloud service (hereinafter referred as “Service” or “Services”). The Service is offered and provided subject to the terms and conditions of this Agreement. The Customer shall connect to the Service using any internet browser or mobile application supported by the Service. The Customer is responsible for obtaining access to the internet and the equipment necessary to access the service.
            </div>
            <div className="glass-card">
                2. Modification of Terms of Service
                Respark reserves the right to update and change the Terms of Service from time to time, an updated version will be published on our website at http://Respark.in/terms-of-service. Any new features that augment or enhance the current Service, including the release of new tools and resources, shall be subject to this Terms of Service. You may terminate your use of the Services if the Terms are modified in a manner that substantially affects your rights in connection with use of the Services. Your continued use of the Service after any such changes shall constitute your consent to such changes.
            </div>
            <div className="glass-card">
                3. Restrictions on Use
                In addition to all other terms and conditions of this Agreement, you shall not:
                <div>i. transfer or otherwise make available to any third party the Services.</div>
                <div>ii. provide any service based on the Services without prior written permission.</div>
                <div> iii. use the Services for spamming and/or other illegal purposes or</div>
                <div>iv. reverse engineer or access the Service in order to (a) build a competitive product or service, (b) build a product using similar ideas, features, functions or graphics of the Service, or (c) copy any ideas, features, functions or graphics of the Service.</div>
            </div>
            <div className="glass-card">
                4. Payment, Refund, and Subscription Terms
                <div>i. To continue using the Services after the free trial period, you must begin a paid subscription which requires a valid credit card. Enterprise customers may request a paper contract that includes alternate billing arrangements including purchase orders.
                </div><div>
                    ii. Paid plan subscription fees are charged for each store or outlet as per monthly/yearly basis.
                </div><div>
                    iii. The Service is billed on a monthly and/or annual basis. In both cases, the amount billed is non-refundable. There will be no refunds or credits for partial months of service.
                </div>
            </div>
        </div>
    )
}

export default Terms

import Footer from '@module/footer'
import { windowRef } from '@util/window';
import React, { useEffect } from 'react'

function Privacy() {
    useEffect(() => {
        if (windowRef) window.scrollTo(0, 0);
    }, [windowRef])

    return (
        <div className="privacy-wrap">
            <h3 className="title glass-card">Privacy Policies</h3>

            <div className="glass-card">
                1. Confidentiality
                Confidential Information of the Customer shall mean all business and technological information of Customer and shall include the Customer Data. Confidential Information of Respark shall mean the Services other than the Customer Data. Confidential Information shall not include any information which is in the public domain (other than through a breach of this agreement), which is independently developed by the recipient or which is received by a third party not under restriction. The recipient will not disclose the Confidential Information, except to affiliates, employees, agents, professional advisors, or third party vendors who participate in the provision of the Services hereunder who need to know it and who have agreed to keep it confidential. The recipient will ensure that those people and entities use the received Confidential Information only to exercise rights and fulfill obligations under this Agreement, while using reasonable care to keep it confidential. The recipient may also disclose Confidential Information to the extent required by an order of a government entity of appropriate jurisdiction; provided that the recipient uses commercially reasonable efforts to promptly notify the other party of such disclosure before complying with such order.
            </div>
            <div className="glass-card">
                <br />
                2. Limitation of Liability
                In no event shall respark be liable for any consequential, incidental, indirect, special, punitive, or other loss or damage whatsoever or for loss of business profits, business interruption, computer failure, loss of business information, or other loss arising out of or caused by your use of or inability to use the service, even if respark has been advised of the possibility of such damage. Your sole and exclusive remedy for any dispute with respark related to any of the services shall be termination of such service. In no event shall respark’s entire liability to you in respect of any service, whether direct or indirect, exceed the last 3 months fees paid by you towards such service.
            </div>
            <div className="glass-card">
                <br />
                3. Privacy Terms
                At Respark, we respect our customers and users' need for online privacy and protect any personal information that may be shared with us, in an appropriate manner. Respark’s practice as regards use of customer personal information is as set forth below. The following provisions are in addition to the confidentiality provisions set forth herein. In the event of a conflict between the provisions of this section and the confidentiality provision, the confidentiality provisions shall prevail.
            </div>
            <div className="glass-card">
                <br />
                4. Shipping Policy :-
                In the event of unavailability of own delivery boys Merchant may use the service provided by third party delivery partners. <br />
                The delivery partner is neither an employee nor an agent or an affiliate of the merchant or it’s technology provider (who merely acts as a technology platform to facilitate the services). <br />
                Merchant and it’s technology partner do not assume any responsibility or liability for any form of act, omission to act, services provided, quality or deficiency of services on part of the delivery partner.<br />
                You hereby agree and acknowledge that all actions, omissions to act, services provided, quality or deficiency in services with respect to food delivery services is of the Delivery Partner in the Delivery Partner’s independent capacity and sole discretion.
            </div>
        </div>
    )
}

export default Privacy

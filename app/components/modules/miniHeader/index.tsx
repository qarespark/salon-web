import React, { } from "react";
import { connect } from 'react-redux';
import router from 'next/router';
import SvgIcon from "@element/svgIcon";
import { useSelector } from 'react-redux';
import { navigateTo } from "@util/routerService";

function MiniHeader({ currentPage }) {
  const currentPageStatus = useSelector(state => state.currentPage);
  const baseRouteUrl = useSelector(state => state.store.baseRouteUrl);

  const onBackClick = () => {
    if (currentPageStatus == 'orderconfirmation' || currentPageStatus == "invoice") navigateTo('home')
    else router.back();
  }
  return (
    <>
      <div className="mainheaderblock mini-header-wrap">
        <div onClick={onBackClick} className="logo back-navigation">
          <SvgIcon icon="backArrow" shape="circle" width={32} height={32} margin="0 0 0 5px" />
        </div>
        <div className="heading">
          {currentPage == 'cart' ? "Cart Details" :
            currentPage == 'checkout' ? "Order details" :
              currentPage == 'invoice' ? "Order Invoice" :
                currentPage == 'appointment' ? "Appointment Details" :
                  ''}
        </div>
      </div>
    </>
  );
}

export default MiniHeader;

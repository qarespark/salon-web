import React, { useState } from 'react'
import { SKILLED_STAFF_NO_IMAGE } from "@constant/noImage";
import Link from 'next/link';
import ImageGalleryModal from '@template/imageGalleryModal';
import { updatePdpItem } from '@context/actions';
import { useSelector, useDispatch } from 'react-redux';
import router from 'next/router';
import { CATEGORY, IMAGES, ITEMS } from '@constant/types';
import { windowRef } from '@util/window';
import { navigateTo } from '@util/routerService';

function HorizontalSquareGrid({ items, config }) {
    const dispatch = useDispatch();
    const baseRouteUrl = useSelector(state => state.store.baseRouteUrl);
    const [activeModalConfig, setactiveModalConfig] = useState<any>({ active: false, itemList: [], config: {}, noImage: SKILLED_STAFF_NO_IMAGE });
    const itemsList = useSelector(state => state.store.storeData.itemsList);

    const onItemClick = (item: any) => {

        if (item.entityType === ITEMS) {
            if (item.curatedItems && item.curatedItems.length == 1) {
                const itemData = itemsList.filter((i: any) => i.name == item.curatedItems[0].name)
                dispatch(updatePdpItem(itemData[0]));
            } else {
                let itemUrl = item.name.toLowerCase().split(" ").join("-");
                if (item.type == 'staff') itemUrl = itemUrl + '-pdp'
                navigateTo(itemUrl);
            }
        } else {
            if (item.curatedItems && item.curatedItems.length != 0) {
                const modalConfig = {
                    active: true,
                    itemList: item.curatedItems,
                    config: {},
                }
                setactiveModalConfig(modalConfig)
            }
        }
    }
    return (
        <>
            {items && items?.map((item, index) => {
                let itemUrl = item.name.toLowerCase().split(" ").join("-");
                if (item.type == 'staff') itemUrl = itemUrl + '-pdp'
                if (item.active && item.showOnUi) {
                    if (!item.imagePath) item.imagePath = SKILLED_STAFF_NO_IMAGE;
                    if (item.entityType === IMAGES || item.entityType === ITEMS) {
                        //open images modal
                        return <div className="skilled-tile clearfix" key={Math.random()} {...config} onClick={() => onItemClick(item)}>
                            <div className="skilled-tile-pic">
                                <img src={item.imagePath} alt={item.name} />
                            </div>
                            <div className="skilled-tile-name">
                                <div className='cat-name' style={{ borderBottom: windowRef()?.location?.host == 'jannez-beauty-salon.respark.in' ? '1px solid gray' : 'unset' }}>{item.name}</div>
                            </div>
                        </div>
                    } else {
                        return <Link href={baseRouteUrl + itemUrl} shallow={true} key={Math.random()}>
                            <div className="skilled-tile clearfix" key={Math.random()} {...config}>
                                <div className="skilled-tile-pic">
                                    <img src={item.imagePath} alt={item.name} />
                                </div>
                                <div className="skilled-tile-name">
                                    <div className='cat-name' style={{ borderBottom: windowRef()?.location?.host == 'jannez-beauty-salon.respark.in' ? '1px solid gray' : 'unset' }}>{item.name}</div>
                                </div>
                            </div>
                        </Link>
                    }
                }
            })}
            {activeModalConfig.active && <ImageGalleryModal
                itemsList={activeModalConfig.itemList}
                config={activeModalConfig.config}
                no_image={activeModalConfig.noImage}
                handleClick={() => setactiveModalConfig({ active: false, itemList: [], config: {}, noImage: SKILLED_STAFF_NO_IMAGE })} />}
        </>
    )
}

export default HorizontalSquareGrid;

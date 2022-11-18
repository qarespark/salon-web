import React from 'react'
import SquareItem from "@element/squareItem";
import { useCookies } from "react-cookie";

function SquareGrid({ items, config, handleClick, noImage }) {
    const [cookie, setCookie] = useCookies(["grp"])
    return (
        <>
            {items ? items?.map((item, index) => {
                if (item.showOnUi) {
                    if ('icon' in item) item.imagePath = item.icon;
                    if (item.icons && item.icons.length != 0 && item.icons[0].active && item.icons[0].imagePath) {
                        if ((!cookie.grp || (item.icons[0].group == 'both')) ? true : cookie.grp == item.icons[0].group) item.imagePath = item.icons[0].imagePath || noImage;
                    }
                    if (item.imagePaths && item.imagePaths?.length !== 0) {
                        item.imagePaths = item.imagePaths.filter((i: any) => !i.deleted)
                    }
                    if (!item.imagePath && (item.imagePaths && item.imagePaths?.length !== 0 && item.imagePaths[0] && item.imagePaths[0].active)) {
                        item.imagePath = item.imagePaths[0].imagePath;
                    }
                    if (!item.imagePath) item.imagePath = noImage;
                    if (config.from != "all") {
                        return <SquareItem item={item} config={config} key={Math.random()} handleClick={handleClick} />
                    } else {
                        if (item.type == config.type) {
                            return <SquareItem item={item} config={config} key={Math.random()} handleClick={handleClick} />
                        }
                    }
                }
            }) :
                null
            }
        </>
    )
}

export default SquareGrid;

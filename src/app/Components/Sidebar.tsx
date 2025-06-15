import { Dropdown } from "./Dropdown"
import { StatTypeDropdown } from "./StatTypeDropdown"
import { PlayerDropdown } from "./PlayerDropdown"
import { constants } from "../constants"

export const Sidebar = () => {
    return (
        <div className="mx-6">
            <StatTypeDropdown/>
            <PlayerDropdown/>
            <Dropdown
                name='Start Year'
                set={constants.FULL_YEARS}
            />
            <Dropdown
                name='End Year'
                set={constants.FULL_YEARS}
            />
        </div>
    )
}
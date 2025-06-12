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
                message="update_start_year"
            />
            <Dropdown
                name='End Year'
                set={constants.FULL_YEARS}
                message="update_end_year"
            />
        </div>
    )
}
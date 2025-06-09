import { Dropdown } from "./Dropdown"
import { StatTypeDropdown } from "./StatTypeDropdown"
import { PlayerDropdown } from "./PlayerDropdown"

export const Sidebar = () => {
    return (
        <div className="mx-6">
            <StatTypeDropdown/>
            <PlayerDropdown/>
            <Dropdown
            name='Start Year'
            set={['Receiving','Rushing','Passing']}
            />
            <Dropdown
            name='End Year'
            set={['Receiving','Rushing','Passing']}
            />
        </div>
    )
}
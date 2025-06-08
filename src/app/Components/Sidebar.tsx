import { Dropdown } from "./Dropdown"

export const Sidebar = () => {
    return (
        <div className="mx-6">
            <Dropdown
            name='Stat Type'
            set={['Receiving','Rushing','Passing']}
            />
            <Dropdown
            name='Player'
            set={['Receiving','Rushing','Passing']}
            />
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
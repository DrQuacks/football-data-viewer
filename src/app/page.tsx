import { Sidebar } from "./Components/Sidebar"
import { ChartsContainer } from "./Components/ChartsContainer"
export default function Home() {
  return(
    <div className="flex flex-col lg:flex-row w-full min-w-0">
      <div className="w-full lg:w-1/4 lg:min-w-80">
        <Sidebar/>
      </div>
      <div className="w-full lg:w-3/4 lg:pl-4">
        <ChartsContainer/>
      </div>
    </div>
  )
}

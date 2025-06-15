import { Sidebar } from "./Components/Sidebar"
import { ChartsContainer } from "./Components/ChartsContainer"
export default function Home() {
  return(
    <div className="flex w-full min-w-0">
      <div className="w-1/4">
        <Sidebar/>
      </div>
      <div className="w-3/4">
        <ChartsContainer/>
      </div>
    </div>
  )
}

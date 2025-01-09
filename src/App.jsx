import Header from "./components/Header"
import SideNav from "./components/SideNav"
import PokeCard from "./components/PokeCard"
import { useState } from "react"

function App() {

  const [ selectedPokemon, setSelectedPokemon ] = useState(0)
  const [ showSideMenu, setShowSideMenu ] = useState(true)

  function handleToggleMenu(){
    setShowSideMenu(!showSideMenu) //sets the state variable to the inverse of its current value
  }

  function handleCloseMenu(){
    setShowSideMenu(true)
  }

  

  return (
    <>
     <Header handleToggleMenu={handleToggleMenu}/>
     <SideNav showSideMenu={showSideMenu} 
     selectedPokemon={selectedPokemon} 
     setSelectedPokemon={setSelectedPokemon} 
     handleCloseMenu={handleCloseMenu}/>
     <PokeCard selectedPokemon={selectedPokemon} />
     </>
  )
}

export default App

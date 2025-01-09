import { useEffect, useState } from "react"
import { getFullPokedexNumber, getPokedexNumber } from "../utils"
import TypeCard from '../components/TypeCard'
import Modal from "./Modal"



export default function PokeCard(props) {
    const { selectedPokemon } = props
    const [ data, setData ] = useState(null)
    const [ loading, setLoading ] = useState(false) 
    const [ skill, setSkill ] = useState(null)
    const [ loadingSkill, setLoadingSkill ] = useState(false)

    const { name, height, abilities, stats, types, moves, sprites } = 
    data || {} //destructures out data from data variable if it exists, if nothing is in there, it will destructure an empty object, as you can't destructure a null object

    const imgList = Object.keys(sprites || {}).filter((val)=>{
        if (!sprites[val]) { return false }
        if (['versions', 'other'].includes(val) ) { return false }
        return true
    }) //this creates an array of the keys that we can now map over 

    async function fetchMoveData(move, moveURL){
        if (loading || !localStorage || !moveURL) {return}
        
        //check cache for move
        let cache = {}
        if (localStorage.getItem('pokemon-moves')){
            cache = JSON.parse(localStorage.getItem('pokemon-moves'))
        }

        if (move in cache) { 
            setSkill(cache[move])
            console.log('Found move in cache')
            return 
        }

        //Fetching data
        try {
            setLoadingSkill(true)
            const res = await fetch(moveURL)
            const moveData = await res.json()
            console.log('Fetched data from API', moveData)

            const description = moveData?.flavor_text_entries.filter(
                val => {
                    return val.version_group.name == 'firered-leafgreen'
                })[0]?.flavor_text

            const skillData = {
                name: move,
                description
            }

            setSkill(skillData)
            cache[move] = skillData
            localStorage.setItem('pokemon-moves', JSON.stringify(cache))


        } catch (err) {
            console.log(err)
        } finally {
            setLoadingSkill(false)
        }


    }


    useEffect(()=>{
        //API call runs whenever selectedPokemon changes

        //if loading, exit logic
        if ( loading || !localStorage ){ return }

        //check if selectedPokemon info is available in cache
            //1. define cache 
        let cache = {}
        if (localStorage.getItem('pokedex')){
            cache = JSON.parse(localStorage.getItem('pokedex'))
        }
            //2. check if selectedPokemon is in cache, otherwise, fetch from API
        if (selectedPokemon in cache){
            //read cache
            setData(cache[selectedPokemon])
            console.log("Found pokemon in cache")
            return
        } 

        //data not in cache - fetch from API!

        async function fetchPokemonData(){
            setLoading(true)
            try {
                const baseURL = 'https://pokeapi.co/api/v2/'
                const suffix = 'pokemon/' + getPokedexNumber(selectedPokemon)
                const finalURL = baseURL + suffix
                
                const res = await fetch(finalURL) 
                const pokemonData = await res.json()
                setData(pokemonData)
                console.log("Fetched pokemon data")

                cache[selectedPokemon] = pokemonData
                localStorage.setItem('pokedex', JSON.stringify(cache))

            } catch (err) {
                console.log(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchPokemonData()
        

        //if we fetch from API, save info to cache for next time 


    }, [selectedPokemon])

    if (loading || !data){
        return (
            <div>
                <h4>Loading...</h4>
            </div>
        )
    }


    return (
        <div className="poke-card">
            {skill && //only if skill=true, render modal
            <Modal handleCloseModal={()=>{ setSkill(null) }}>
                <div>
                    <h6>Name</h6>
                    <h2 className="skill-name" >{skill.name.replaceAll('-', ' ')}</h2>

                </div>
                <div>
                    <h6>Description</h6>
                    <p>{skill.description}</p>
                </div>
            </Modal>}
            <div>
                <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
                <h2>{name}</h2>
            </div>

            <div className="type-container"> 
                {types.map((typeObj, typeIndex)=>{
                    return (
                        <TypeCard key={typeIndex} type={typeObj?.type?.name}/>
                    )

                }) }
            </div>
            
            <img className="default-img" src={'/pokemon/' + 
                getFullPokedexNumber(selectedPokemon) + 
                '.png'} alt={`${name}-large-img`}/>

            <div className="img-container">
                {imgList.map((spriteURL, spriteIndex)=>{
                    const imgURL = sprites[spriteURL]

                    return (
                        <img key={spriteIndex} src={imgURL} alt={`${name}
                        -img-${spriteURL}`}/>
                    )
                })}
            </div>
            <h3>Stats</h3>
            <div className="stats-card">
                {stats.map((statObj, statIndex)=>{
                    const { stat, base_stat } = statObj
                    return (
                        <div key={statIndex} className="stat-item">
                            <p>{stat?.name.replaceAll('-', ' ')}</p>
                            <h4>{base_stat}</h4>

                        </div>
                    )
                })}
            </div>
            <h3>Moves</h3>
            <div className="pokemon-move-grid">
                {moves.map((moveObj, moveIndex)=>{
                    return (
                        <button className="button-card pokemon-move" key={moveIndex} onClick={()=>{
                            fetchMoveData(moveObj?.move?.name, 
                                moveObj?.move?.url)
                        }}>
                            <p>{moveObj?.move?.name.replaceAll('-', ' ')}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
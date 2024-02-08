// import { TEvento } from "@/models/Evento";
import React, { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import { Search } from "../models/bo/Search";
import { Song, songToSearch } from "../models/entities/Song";
import { Artist, artistToSearch } from "../models/entities/Artist";

type SearchContextProps = {
   /*feed: TEvento[];
   setFeed: Dispatch<SetStateAction<TEvento[]>>; //(eventos: TEvento[]) => void;
   addEventoFeed: (e: TEvento) => void;
   removerEventoFeed: (idEvento: number) => void;

   meusEventos: TEvento[];
   setMeusEventos: Dispatch<SetStateAction<TEvento[]>>; //(eventos: TEvento[]) => void;
   addMeuEvento: (e: TEvento) => void;
   removerMeuEvento: (idEvento: number) => void;*/

   results: Search[];
   setResults: Dispatch<SetStateAction<Search[]>>;
   addSong: (song: Song) => void;
   addArtist: (artist: Artist) => void;
   updateArtist: (artist: Artist) => void;
}

const SearchContext = createContext<SearchContextProps>({} as SearchContextProps);

type SearchProviderProps = {
   children: React.ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) =>
{
   const [results, setResults] = useState<Search[]>([]);

   const addSong = (song: Song) =>
      results.unshift(
         songToSearch(song)
      );

   const addArtist = (artist: Artist) =>
      results.unshift(
         artistToSearch(artist)
      );

   const updateArtist = (artist: Artist) =>
      setResults(list => list.map(r => r.id === artist.id
         ? artistToSearch(artist)
         : r
      ));

   /*
   const [meusEventos, setMeusEventos] = useState<TEvento[]>([]);

   const addEventoFeed = (e: TEvento) =>
      setFeed([...feed, e]);

   const removerEventoFeed = (idEvento: number) =>
      setFeed(feed.filter(e => e.id !== idEvento));

   const addMeuEvento = (e: TEvento) =>
      setMeusEventos([...meusEventos, e]);
   
   const removerMeuEvento = (idEvento: number) =>
      setMeusEventos(meusEventos.filter(e => e.id !== idEvento))
    */

   return (
      <SearchContext.Provider value={{
         results, setResults,
         addSong,
         addArtist, updateArtist
      }}>
         { children }
      </SearchContext.Provider>
   )
}

export const useSearch = () => useContext(SearchContext);
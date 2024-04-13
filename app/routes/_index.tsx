import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import localforage from "localforage";

type Pokemon = {
  results: {
    name: string;
  }[];
};

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function clientLoader() {
  await getPokemons();
  return memory;
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}

let memory: Pokemon | null;
const getPokemons = async () => {
  const pokemons: Pokemon | null = await localforage.getItem("pokedex");
  if (pokemons) {
    memory = pokemons;
    return;
  }
  const headers = new Headers();
  headers.append("Cache-Control", "60 * 60 * 24");
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151", {
    headers: headers,
  });
  const pokemon = await response.json();
  localforage.setItem("pokedex", pokemon);
  memory = pokemon;
};

export default function Index() {
  const pokemons = useLoaderData<typeof clientLoader>();
  if (!pokemons) {
    return <span>no pokemons</span>;
  }
  return (
    <div className="min-h-screen bg-slate-900 p-40">
      <div className="flex justify-between py-2">
        <h1 className="text-3xl text-white">Gen 1</h1>
      </div>
      <ul className="border border-red-400/30 p-20">
        <div className="grid grid-flow-row grid-cols-3 gap-8">
          {pokemons.results.map(
            (pokemon: Pokemon["results"][number], i: number) => (
              <li key={i} className="text-white text-2xl text-center">
                {pokemon.name.toUpperCase()}
              </li>
            ),
          )}
        </div>
      </ul>
    </div>
  );
}


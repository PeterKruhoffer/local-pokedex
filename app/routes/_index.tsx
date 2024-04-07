import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import localforage from "localforage";

type Pokemon = {
  name: string;
  types: string[];
};

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const localPokedexStore = localforage.createInstance({
  name: "localPokedexStore",
  storeName: "pokedex",
});

export const clientLoader = async () => {
  //localPokedexStore.removeItem("dex");
  const pokemons: Pokemon[] = [];
  await localPokedexStore.iterate((value: Pokemon, key) => {
    pokemons.push({
      name: key,
      types: [...value.types],
    });
  });

  return pokemons;
};

export function HydrateFallback() {
  return <p>Loading...</p>;
}

export default function Index() {
  const pokemons = useLoaderData<typeof clientLoader>();
  return (
    <div className="min-h-screen bg-slate-900 p-20">
      <h1 className="text-3xl text-white">Welcome to Remix</h1>
      <ul className="border border-red-400/30 p-20">
        <li className="text-2xl text-white">Hello world</li>
        {pokemons.map((pokemon, i) => (
          <li key={i} className="text-white text-2xl flex gap-2">
            {pokemon.name}
            {pokemon.types.map((t, index) => (
              <span key={index}>{t}</span>
            ))}
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          localPokedexStore.setItem("bayleaf", {
            name: "bayleaf",
            types: ["grass"],
          })
        }
        className="text-white p-2 border-red-400/30"
      >
        Save item
      </button>
    </div>
  );
}

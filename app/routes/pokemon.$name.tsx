import { Link, useLoaderData } from "@remix-run/react";
type Pokemon = {
  name: string
  sprites: {
    front_default: string
  }
  types: {
    type: {
      name:string
    }
  }[]
}

// Initial SSR and first visits will get fresh data from the DB on the server
export async function loader({ params }) {
  const headers = new Headers();
  headers.append("Cache-Control", "60 * 60 * 24");
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${params.name}`,
    {
      headers: headers,
    },
  );
  const pokemon: Pokemon = await response.json();
  return { pokemon: pokemon };
}

// Cache movies individually in session storage in the browser for super fast
// back/forward/revisits during the session, but will fetch fresh data
// from the server if the user closes the tab and comes back later
export async function clientLoader({ serverLoader, params }) {
  let cacheKey = `pokemon-${params.name}`;
  let cache = sessionStorage.getItem(cacheKey);
  if (cache) return { pokemon: JSON.parse(cache) };

  let { pokemon } = await serverLoader();
  sessionStorage.setItem(cacheKey, JSON.stringify(pokemon));
  return { pokemon };
}

export default function Pokemon() {
  const { pokemon } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col justify-center items-center flex-1 p-40">
      <Link
        to="/"
        prefetch="intent"
        className="text-lg text-white absolute top-5 left-5 underline underline-offset-4"
      >
        Home
      </Link>
      <h2 className="text-5xl text-white">{pokemon.name.toUpperCase()}</h2>
      <img
        src={pokemon.sprites.front_default}
        alt="pokemon"
        className="w-52 h-52"
      />
      <div className="flex gap-2">
        {pokemon.types.map((type, i) => (
          <p key={i} className="text-xl text-white">
            {type.type.name}
          </p>
        ))}
      </div>
    </div>
  );
}

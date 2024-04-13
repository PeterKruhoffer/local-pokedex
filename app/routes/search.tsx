import * as Dialog from "@radix-ui/react-dialog";
import { useFetcher, useLocation } from "@remix-run/react";
import localforage from "localforage";
import { ReactNode, useEffect, useRef, useState } from "react";

type Pokemon = {
  results: {
    name: string;
  }[];
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

export function Search() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  let location = useLocation();
  const search = useFetcher();

  useEffect(() => {
    if (show && ref.current) {
      //@ts-ignore-next-line
      ref.current.select();
    }
  }, [show]);

  useEffect(() => {
    setShow(false);
  }, [location]);

  // bind command + k
  useEffect(() => {
    //@ts-ignore-next-line
    const listener = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setShow(true);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <div>
      <MyDialog open={show}>
        <search.Form method="get" action="/search">
          <fieldset className="mb-[15px] flex items-center gap-5">
            <label
              className="text-black w-[90px] text-right text-[15px]"
              htmlFor="search"
            >
              Search:
            </label>
            <input
              ref={ref}
              type="search"
              placeholder="search"
              name="q"
              className="text-black inline-flex h-[35px] w-1/2 flex-1 items-center justify-center rounded-s px-3 text-[15px] leading-none outline-none border"
              id="search"
              onKeyDown={(event) => {
                if (
                  event.key === "Escape" &&
                  event.currentTarget.value === ""
                ) {
                  setShow(false);
                } else {
                  event.stopPropagation();
                }
              }}
              onChange={(event) => {
                search.submit(event.currentTarget.form);
              }}
            />
          </fieldset>
        </search.Form>
      </MyDialog>
    </div>
  );
}

function MyDialog(props: { children: ReactNode; open: boolean }) {
  function queryPokemon(query: string) {
    const match: string[] = [];
    if (!memory) {
      return;
    }
    for (let pokemon of memory.results) {
      if (pokemon.name.toLowerCase().includes(query)) {
        match.push(pokemon.name);
      }

      if (match.length >= 20) {
        break;
      }
    }
    return match;
  }

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Trigger asChild>
        <button className="text-black inline-flex h-[35px] items-center justify-center rounded-s bg-white px-[15px] font-medium leading-none  focus:outline-none">
          Search
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/30 backdrop-blur-sm fixed inset-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[50vh] h-[80vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 focus:outline-none">
          {props.children}
          <div className="flex justify-end">
            <Dialog.Close asChild>
              <button className="bg-slate-900 text-white hover:bg-slate-950 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none">
                Close
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className="text-violet-200 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:outline-none"
              aria-label="Close"
            ></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

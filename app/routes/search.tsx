import * as Dialog from "@radix-ui/react-dialog";
import { Link, useFetcher, useLocation } from "@remix-run/react";
import localforage from "localforage";
import { ReactNode, useEffect, useRef, useState } from "react";

type Pokemon = {
  results: {
    name: string;
  }[];
};

export async function clientLoader({ request }) {
  const q = new URL(request.url).searchParams.get("q");
  if (!q) return [];
  await getPokemon(q);
  return memory;
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}

let memory: string[] | null;
const getPokemon = async (query: string) => {
  const pokemons: Pokemon | null = await localforage.getItem("pokedex");
  let matches: string[] = [];
  if (pokemons) {
    for (let i = 0; i < pokemons.results.length; i++) {
      if (
        pokemons.results[i].name.toLowerCase().includes(query.toLowerCase())
      ) {
        matches.push(pokemons.results[i].name);
      }
      if (matches.length >= 8) {
        memory = matches;
        return;
      }
    }
  }
  memory = matches;
};

export function Search() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const search = useFetcher<string[]>();

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
              className="text-white w-[90px] text-right text-lg"
              htmlFor="search"
            >
              Search:
            </label>
            <input
              ref={ref}
              type="search"
              placeholder="search"
              name="q"
              className="text-black inline-flex h-[35px] w-1/2 flex-1 items-center justify-center rounded-s px-3 text-xl leading-none outline-none border"
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
        <ul className="flex flex-col gap-y-4 text-white">
          {search.data?.map((item, i) => (
            <li key={i}>
              <Link
                to={`/pokemon/${item}`}
                prefetch="intent"
                className="text-2xl w-full p-4"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </MyDialog>
    </div>
  );
}

function MyDialog(props: { children: ReactNode; open: boolean }) {
  return (
    <Dialog.Root open={props.open}>
      <Dialog.Trigger asChild>
        <button className="text-black inline-flex h-[35px] items-center justify-center rounded-s bg-white px-[15px] font-medium leading-none  focus:outline-none">
          Search
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/30 backdrop-blur-sm fixed inset-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[50vh] h-[80vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-md bg-slate-500/30 backdrop-blur-sm p-6 focus:outline-none">
          <div className="relative">
            {props.children}
            <div className="absolute top-12 right-0">
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

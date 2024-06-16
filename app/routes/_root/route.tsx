import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { ModeToggle } from '~/components/dark-mode-toggle'
import { HStack } from '~/components/ui/stack'
import { SearchPanel } from '~/routes/resources.search/route'
import { buildMenu, getCurrentMenuItem } from '~/services/menu.server'
import { MobileMenu, SideMenu } from './components'
export const shouldRevalidate = () => true

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const filename = `docs${url.pathname === '/' ? '/index.md' : url.pathname}.md`
  const menu = await buildMenu()
  const currentMenuItem = getCurrentMenuItem(menu, filename) ?? {
    attrs: { title: 'Remix ドキュメント' },
    slug: '',
    children: [],
    hasContent: false,
    filename: 'docs/index.md',
  }
  return { menu, currentMenuItem }
}

export default function Layout() {
  const { menu, currentMenuItem } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!location.hash) mainRef.current?.scrollIntoView({ block: 'start' })
  }, [pathname])

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr] lg:container">
      <header className="w-full bg-background text-foreground">
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <Link to="/" prefetch="intent">
                Remix ドキュメント
                <span className="whitespace-nowrap">日本語版</span>
              </Link>
            </h1>

            <HStack className="gap-0.5">
              <ModeToggle />
              <SearchPanel />
            </HStack>
          </div>

          <div className="flex-1" />

          <a
            className="hover text-sm hover:underline"
            href={`https://remix.run/docs${pathname}`}
          >
            English
          </a>
        </div>
        <MobileMenu menu={menu} currentMenuItem={currentMenuItem} />
      </header>

      <div className="grid grid-cols-1 overflow-auto md:grid-cols-[16rem_1fr]">
        <SideMenu menu={menu} />

        <div className="grid grid-cols-1 grid-rows-[1fr_auto] overflow-y-auto">
          <main ref={mainRef}>
            <Outlet />
          </main>

          <footer className="flex border-t px-4 py-1 text-sm text-muted-foreground">
            <div className="flex-1">
              Docs and examples{' '}
              <a
                href="https://github.com/coji/remix-docs-ja/blob/main/LICENSE"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                licensed under MIT.
              </a>
            </div>
            <div>
              <a
                href={`https://github.com/coji/remix-docs-ja/edit/main/docs${pathname}.md`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Edit
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

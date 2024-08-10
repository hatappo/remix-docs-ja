import {
  unstable_defineLoader as defineLoader,
  type LinksFunction,
} from '@remix-run/node'
import {
  useLoaderData,
  useLocation,
  type MetaArgs_SingleFetch,
} from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { Stack } from '~/components/ui'
import { buildPageMeta } from '~/libs/seo'
import { cn } from '~/libs/utils'
import { JobBoard } from '~/routes/resources.job-board'
import { getDocJson } from '~/services/document.server'
import markdownStyles from '~/styles/md.css?url'
import { MobileToc } from './components/mobile-toc'
import {
  TableOfContents,
  TableOfContentsItem,
  TableOfContentsTitle,
} from './components/toc'

export const meta = ({
  location,
  data,
}: MetaArgs_SingleFetch<typeof loader>) => {
  if (!data) {
    return []
  }
  const { doc } = data
  return buildPageMeta({
    title: String(doc.attributes.title),
    pathname: location.pathname,
  })
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: markdownStyles },
]

export const loader = defineLoader(async ({ params }) => {
  const filename = params['*'] ?? 'index'
  const doc = await getDocJson(filename)
  if (!doc) {
    throw new Response('File not found', { status: 404 })
  }

  return { doc }
})

export default function Docs() {
  const { doc } = useLoaderData<typeof loader>()
  const { hash, pathname } = useLocation()
  const mainRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(
          decodeURIComponent(location.hash),
        )
        if (element) {
          element.scrollIntoView()
        }
      }, 100)
    } else {
      mainRef.current?.scrollTo(0, 0)
    }
  }, [hash, pathname])

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr] md:grid-cols-[auto_minmax(14rem,1fr)]">
      <div
        ref={mainRef}
        className={cn(
          'md-prose prose order-2 overflow-auto scroll-smooth px-4 pb-32 pt-8 dark:prose-invert md:order-1 md:pt-2',
          'max-w-none',
        )}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />

      <Stack className="order-1 gap-0 overflow-auto md:order-2 md:mr-2 md:gap-4">
        <JobBoard className="hidden md:block" />

        {doc.headings.length > 0 && (
          <>
            <TableOfContents>
              <TableOfContentsTitle>目次</TableOfContentsTitle>
              {doc.headings.map((heading) => (
                <TableOfContentsItem
                  key={heading.slug}
                  className={cn(heading.headingLevel === 'h3' && 'ml-4')}
                >
                  <a href={`#${heading.slug}`}>{heading.html}</a>
                </TableOfContentsItem>
              ))}
            </TableOfContents>

            <MobileToc headings={doc.headings} />
          </>
        )}
      </Stack>
    </div>
  )
}

import { unstable_defineLoader as defineLoader, json } from '@remix-run/node'
import { Link, useFetcher, useLocation } from '@remix-run/react'
import { ChevronsRightIcon } from 'lucide-react'
import { useEffect } from 'react'
import jobs from '~/assets/jobs.json'
import { Badge, HStack, Stack } from '~/components/ui'
import { cn } from '~/libs/utils'

export const loader = defineLoader(() => {
  // ランダムに１件の求人情報を返す
  const openJobs = jobs.filter((job) => {
    return (
      new Date(job.openAt) <= new Date() && new Date(job.expiredAt) > new Date()
    )
  })
  const job = openJobs[Math.floor(Math.random() * openJobs.length)]

  // キャッシュ完全無効
  return json(
    { job, count: openJobs.length },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
})

interface JobBoardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const JobBoard = ({ className }: JobBoardProps) => {
  const fetcher = useFetcher<typeof loader>()
  const { pathname } = useLocation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetcher.load('/resources/job-board')
  }, [pathname])

  const job = fetcher?.data?.job
  const count = fetcher?.data?.count

  if (!job) {
    return <></>
  }

  return (
    <div
      className={cn('rounded-md border-2 border-primary md:block', className)}
    >
      <div className="rounded-md px-2 py-1 text-sm hover:bg-secondary">
        <Stack className="gap-1" asChild>
          <a href={job.href} target="_blank" rel="noreferrer">
            <HStack className="flex-wrap gap-0">
              <div className="font-bold">{job.title}</div>
              <div className="flex-1" />
              <div className="break-all text-xs text-primary/50">
                {job.company}
              </div>
            </HStack>
            <HStack className="flex-wrap gap-1">
              {job.tags.map((tag) => {
                return <Badge key={tag}>{tag}</Badge>
              })}
            </HStack>
          </a>
        </Stack>
      </div>
      <div className="bg-primary px-2 pt-0.5 text-xs">
        <HStack asChild className="text-primary-foreground hover:underline">
          <Link to="/job-board/">
            <div className="flex-1 whitespace-nowrap">
              Remix のお仕事あります
            </div>
            <div className="flex items-center gap-1">
              <ChevronsRightIcon size="10" className="inline" />
              <span>
                {count}
                <small>件</small>
              </span>
            </div>
          </Link>
        </HStack>
      </div>
    </div>
  )
}

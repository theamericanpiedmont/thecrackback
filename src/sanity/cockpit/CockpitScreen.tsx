import {useCallback, useEffect, useMemo, useState} from "react"
import {useClient} from "sanity"
import {useIntentLink} from "sanity/router"
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@sanity/ui"
import {
  AddIcon,
  BulbOutlineIcon,
  ComposeIcon,
  DocumentsIcon,
  PublishIcon,
  SearchIcon,
} from "@sanity/icons"

type Provenance = {
  immediateSourceId?: string
  immediateSourceType?: string
  immediateSourceTitle?: string
  immediateSourceSubtitle?: string
  rootSourceId?: string
  rootSourceType?: string
  rootSourceTitle?: string
  rootSourceSubtitle?: string
  promotedAt?: string
}

type SignalDoc = {
  _id: string
  _type: string
  _createdAt?: string
  title?: string
  score?: number
  pillar?: string
  civicTag?: string
  status?: string
  sourceTitle?: string
  sourceName?: string
  sourceUrl?: string
  memoryRelevance?: string
  publishedAt?: string
}

type SquibDoc = {
  _id: string
  _type: string
  _createdAt?: string
  title?: string
  provenance?: Provenance
}

type AssignmentDoc = {
  _id: string
  _type: string
  _createdAt?: string
  title?: string
  slug?: {
    current?: string
  }
  provenance?: Provenance
}

type CrackbackDoc = {
  _id: string
  _type: string
  _createdAt?: string
  title?: string
  slug?: {
    current?: string
  }
}

const SIGNALS_QUERY = `
*[
  _type == "signalCandidate"
  && !(_id in path("drafts.**"))
]
| order(_createdAt desc)[0...12]{
  _id,
  _type,
  _createdAt,
  title,
  score,
  pillar,
  civicTag,
  status,
  sourceTitle,
  sourceName,
  sourceUrl,
  memoryRelevance,
  publishedAt
}
`

const SQUIBS_QUERY = `
*[
  _type == "squib"
]
| order(_updatedAt desc)[0...12]{
  _id,
  _type,
  _createdAt,
  title,
  provenance{
    immediateSourceId,
    immediateSourceType,
    immediateSourceTitle,
    immediateSourceSubtitle,
    rootSourceId,
    rootSourceType,
    rootSourceTitle,
    rootSourceSubtitle,
    promotedAt
  }
}
`

const ASSIGNMENTS_QUERY = `
*[
  _type == "crackbackPost"
]
| order(_updatedAt desc)[0...12]{
  _id,
  _type,
  _createdAt,
  title,
  slug,
  provenance{
    immediateSourceId,
    immediateSourceType,
    immediateSourceTitle,
    immediateSourceSubtitle,
    rootSourceId,
    rootSourceType,
    rootSourceTitle,
    rootSourceSubtitle,
    promotedAt
  }
}
`

const CRACKBACKS_QUERY = `
*[
  _type == "crackback"
]
| order(_updatedAt desc)[0...12]{
  _id,
  _type,
  _createdAt,
  title,
  slug
}
`

type Tone = "primary" | "positive" | "caution" | "default" | "critical"

function toneForStatus(status?: string): Tone {
  switch (status) {
    case "suggested":
      return "primary"
    case "published":
      return "positive"
    case "rejected":
      return "caution"
    case "approved":
      return "positive"
    default:
      return "default"
  }
}

function signalTitle(signal: SignalDoc) {
  return signal.title || "Untitled signal"
}

function signalSubtitle(signal: SignalDoc) {
  const parts = [
    signal.sourceTitle || signal.sourceName,
    signal.pillar,
    signal.civicTag,
  ].filter(Boolean)

  return parts.length ? parts.join(" · ") : "Signal candidate"
}

function squibTitle(squib: SquibDoc) {
  return squib.title || "Untitled thought"
}

function assignmentTitle(assignment: AssignmentDoc) {
  return assignment.title || "Untitled assignment"
}

function crackbackTitle(crackback: CrackbackDoc) {
  return crackback.title || "Untitled crackback"
}

function squibSubtitle(squib: SquibDoc) {
  const base = "Squib"

  if (squib.provenance?.immediateSourceTitle) {
    return `${base} · From ${squib.provenance.immediateSourceType || "source"}: ${squib.provenance.immediateSourceTitle}`
  }

  return base
}

function assignmentSubtitle(assignment: AssignmentDoc) {
  const parts: string[] = ["Crackback Post"]

  if (assignment.slug?.current) {
    parts.push(`/posts/${assignment.slug.current}`)
  }

  if (assignment.provenance?.immediateSourceTitle) {
    parts.push(
      `From ${assignment.provenance.immediateSourceType || "source"}: ${assignment.provenance.immediateSourceTitle}`
    )
  }

  if (
    assignment.provenance?.rootSourceTitle &&
    assignment.provenance.rootSourceTitle !== assignment.provenance.immediateSourceTitle
  ) {
    parts.push(`Origin: ${assignment.provenance.rootSourceTitle}`)
  }

  return parts.join(" · ")
}

function crackbackSubtitle(crackback: CrackbackDoc) {
  if (crackback.slug?.current) {
    return `Crackback · /crackbacks/${crackback.slug.current}`
  }

  return "Crackback"
}

function getPublishedId(id: string) {
  return id.startsWith("drafts.") ? id.slice(7) : id
}

function getDraftId(id: string) {
  return id.startsWith("drafts.") ? id : `drafts.${id}`
}

function stripSystemFields<T extends Record<string, any>>(doc: T) {
  const {_createdAt, _updatedAt, _rev, ...rest} = doc
  return rest
}

function buildSignalProvenance(signal: SignalDoc): Provenance {
  const subtitle = signalSubtitle(signal)
  const title = signalTitle(signal)

  return {
    immediateSourceId: signal._id,
    immediateSourceType: signal._type,
    immediateSourceTitle: title,
    immediateSourceSubtitle: subtitle,
    rootSourceId: signal._id,
    rootSourceType: signal._type,
    rootSourceTitle: title,
    rootSourceSubtitle: subtitle,
    promotedAt: new Date().toISOString(),
  }
}

function buildSquibToAssignmentProvenance(squib: SquibDoc): Provenance {
  const squibTitleValue = squibTitle(squib)
  const squibSubtitleValue = squibSubtitle(squib)

  return {
    immediateSourceId: squib._id,
    immediateSourceType: squib._type,
    immediateSourceTitle: squibTitleValue,
    immediateSourceSubtitle: squibSubtitleValue,
    rootSourceId: squib.provenance?.rootSourceId || squib._id,
    rootSourceType: squib.provenance?.rootSourceType || squib._type,
    rootSourceTitle: squib.provenance?.rootSourceTitle || squibTitleValue,
    rootSourceSubtitle: squib.provenance?.rootSourceSubtitle || squibSubtitleValue,
    promotedAt: new Date().toISOString(),
  }
}

function QueueShell(props: {
  title: string
  subtitle: string
  onRefresh: () => void
  children: React.ReactNode
}) {
  const {title, subtitle, onRefresh, children} = props

  return (
    <Card padding={4} radius={3} shadow={1} border style={{height: "100%"}}>
      <Stack space={4} style={{height: "100%"}}>
        <Flex align="center" justify="space-between">
          <Box>
            <Heading size={1}>{title}</Heading>
            <Text size={1} muted style={{display: "block", marginTop: 2}}>
              {subtitle}
            </Text>
          </Box>

          <Button mode="ghost" text="Refresh" onClick={onRefresh} />
        </Flex>

        <Box flex={1}>{children}</Box>
      </Stack>
    </Card>
  )
}

function QueueItem(props: {
  title: string
  subtitle?: string
  badge?: {
    label: string
    tone?: Tone
  }
  actions: React.ReactNode
}) {
  const {title, subtitle, badge, actions} = props

  return (
    <Card padding={4} radius={2} border>
      <Stack space={4}>
        <Flex align="flex-start" justify="space-between" gap={3}>
          <Box flex={1}>
            <Text
              weight="semibold"
              size={2}
              style={{
                display: "block",
                lineHeight: 1.3,
                marginBottom: subtitle ? 6 : 0,
              }}
            >
              {title}
            </Text>

            {subtitle ? (
              <Text
                size={1}
                muted
                style={{
                  display: "block",
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </Box>

          {badge ? <Badge tone={badge.tone || "default"}>{badge.label}</Badge> : null}
        </Flex>

        <Flex gap={2} wrap="wrap">
          {actions}
        </Flex>
      </Stack>
    </Card>
  )
}

function SignalRow(props: {
  signal: SignalDoc
  onPromoteToThought: (signal: SignalDoc) => Promise<void>
  onPublishSignal: (signal: SignalDoc) => Promise<void>
  isPromoting: boolean
  isPublishing: boolean
}) {
  const {signal, onPromoteToThought, onPublishSignal, isPromoting, isPublishing} = props

  const editLink = useIntentLink({
    intent: "edit",
    params: {
      id: signal._id,
      type: signal._type,
    },
  })

  const alreadyPublished = signal.status === "published"

  return (
    <QueueItem
      title={signalTitle(signal)}
      subtitle={signalSubtitle(signal)}
      badge={{
        label: signal.status || "unknown",
        tone: toneForStatus(signal.status),
      }}
      actions={
        <>
          <Button
            as="a"
            href={editLink.href}
            onClick={editLink.onClick}
            text="Open"
            mode="ghost"
          />

          <Button
            text={isPromoting ? "Promoting..." : "Promote to Thought"}
            icon={BulbOutlineIcon}
            tone="primary"
            disabled={isPromoting}
            onClick={() => onPromoteToThought(signal)}
          />

          <Button
            text={
              alreadyPublished
                ? "Published"
                : isPublishing
                  ? "Publishing..."
                  : "Publish Signal"
            }
            icon={PublishIcon}
            mode={alreadyPublished ? "ghost" : "default"}
            tone={alreadyPublished ? "positive" : "primary"}
            disabled={alreadyPublished || isPublishing}
            onClick={() => onPublishSignal(signal)}
          />
        </>
      }
    />
  )
}

function SquibRow(props: {
  squib: SquibDoc
  onPromoteToAssignment: (squib: SquibDoc) => Promise<void>
  onPublishThought: (squib: SquibDoc) => Promise<void>
  isPromoting: boolean
  isPublishing: boolean
}) {
  const {squib, onPromoteToAssignment, onPublishThought, isPromoting, isPublishing} = props

  const editLink = useIntentLink({
    intent: "edit",
    params: {
      id: squib._id,
      type: squib._type,
    },
  })

  const isDraft = squib._id.startsWith("drafts.")

  return (
    <QueueItem
      title={squibTitle(squib)}
      subtitle={squibSubtitle(squib)}
      actions={
        <>
          <Button
            as="a"
            href={editLink.href}
            onClick={editLink.onClick}
            text="Open"
            mode="ghost"
          />

          <Button
            text={isPromoting ? "Promoting..." : "Promote to Assignment"}
            icon={DocumentsIcon}
            tone="primary"
            disabled={isPromoting}
            onClick={() => onPromoteToAssignment(squib)}
          />

          <Button
            text={isPublishing ? "Publishing..." : isDraft ? "Publish Thought" : "Republish Thought"}
            icon={PublishIcon}
            tone="primary"
            disabled={isPublishing}
            onClick={() => onPublishThought(squib)}
          />
        </>
      }
    />
  )
}

function AssignmentRow({assignment}: {assignment: AssignmentDoc}) {
  const editLink = useIntentLink({
    intent: "edit",
    params: {
      id: assignment._id,
      type: assignment._type,
    },
  })

  return (
    <QueueItem
      title={assignmentTitle(assignment)}
      subtitle={assignmentSubtitle(assignment)}
      actions={
        <Button
          as="a"
          href={editLink.href}
          onClick={editLink.onClick}
          text="Open"
          mode="ghost"
        />
      }
    />
  )
}

function CrackbackRow({crackback}: {crackback: CrackbackDoc}) {
  const editLink = useIntentLink({
    intent: "edit",
    params: {
      id: crackback._id,
      type: crackback._type,
    },
  })

  return (
    <QueueItem
      title={crackbackTitle(crackback)}
      subtitle={crackbackSubtitle(crackback)}
      actions={
        <Button
          as="a"
          href={editLink.href}
          onClick={editLink.onClick}
          text="Open"
          mode="ghost"
        />
      }
    />
  )
}

export function CockpitScreen() {
  const client = useClient({apiVersion: "2026-04-01"})

  const [signals, setSignals] = useState<SignalDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [promotingSignalId, setPromotingSignalId] = useState<string | null>(null)
  const [publishingSignalId, setPublishingSignalId] = useState<string | null>(null)

  const [squibs, setSquibs] = useState<SquibDoc[]>([])
  const [squibsLoading, setSquibsLoading] = useState(true)
  const [squibsError, setSquibsError] = useState<string | null>(null)
  const [promotingSquibId, setPromotingSquibId] = useState<string | null>(null)
  const [publishingSquibId, setPublishingSquibId] = useState<string | null>(null)

  const [assignments, setAssignments] = useState<AssignmentDoc[]>([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(true)
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null)

  const [crackbacks, setCrackbacks] = useState<CrackbackDoc[]>([])
  const [crackbacksLoading, setCrackbacksLoading] = useState(true)
  const [crackbacksError, setCrackbacksError] = useState<string | null>(null)

  const loadSignals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await client.fetch<SignalDoc[]>(SIGNALS_QUERY)
      setSignals(data || [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load signals"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [client])

  const loadSquibs = useCallback(async () => {
    try {
      setSquibsLoading(true)
      setSquibsError(null)
      const data = await client.fetch<SquibDoc[]>(SQUIBS_QUERY)
      setSquibs(data || [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load squibs"
      setSquibsError(message)
    } finally {
      setSquibsLoading(false)
    }
  }, [client])

  const loadAssignments = useCallback(async () => {
    try {
      setAssignmentsLoading(true)
      setAssignmentsError(null)
      const data = await client.fetch<AssignmentDoc[]>(ASSIGNMENTS_QUERY)
      setAssignments(data || [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load assignments"
      setAssignmentsError(message)
    } finally {
      setAssignmentsLoading(false)
    }
  }, [client])

  const loadCrackbacks = useCallback(async () => {
    try {
      setCrackbacksLoading(true)
      setCrackbacksError(null)
      const data = await client.fetch<CrackbackDoc[]>(CRACKBACKS_QUERY)
      setCrackbacks(data || [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load crackbacks"
      setCrackbacksError(message)
    } finally {
      setCrackbacksLoading(false)
    }
  }, [client])

  useEffect(() => {
    loadSignals()
    loadSquibs()
    loadAssignments()
    loadCrackbacks()
  }, [loadSignals, loadSquibs, loadAssignments, loadCrackbacks])

  const signalCount = useMemo(() => signals.length, [signals])
  const squibCount = useMemo(() => squibs.length, [squibs])
  const assignmentCount = useMemo(() => assignments.length, [assignments])
  const crackbackCount = useMemo(() => crackbacks.length, [crackbacks])

  const handlePromoteToThought = useCallback(
    async (signal: SignalDoc) => {
      try {
        setPromotingSignalId(signal._id)
        setError(null)

        const newSquib = await client.create({
          _type: "squib",
          title: signalTitle(signal),
          provenance: buildSignalProvenance(signal),
        })

        await loadSquibs()

        window.location.href = `/studio/intent/edit/id=${newSquib._id};type=squib`
      } catch (err) {
        console.error("Promote to Thought failed:", err)

        const message =
          err instanceof Error ? err.message : JSON.stringify(err, null, 2)

        setError(message)
      } finally {
        setPromotingSignalId(null)
      }
    },
    [client, loadSquibs]
  )

  const handlePublishSignal = useCallback(
    async (signal: SignalDoc) => {
      try {
        setPublishingSignalId(signal._id)
        setError(null)

        await client
          .patch(signal._id)
          .set({
            status: "published",
            publishedAt: new Date().toISOString(),
          })
          .commit()

        await loadSignals()
      } catch (err) {
        console.error("Publish Signal failed:", err)

        const message =
          err instanceof Error ? err.message : JSON.stringify(err, null, 2)

        setError(message)
      } finally {
        setPublishingSignalId(null)
      }
    },
    [client, loadSignals]
  )

  const handlePromoteToAssignment = useCallback(
    async (squib: SquibDoc) => {
      try {
        setPromotingSquibId(squib._id)
        setSquibsError(null)

        const newAssignment = await client.create({
          _type: "crackbackPost",
          title: squibTitle(squib),
          provenance: buildSquibToAssignmentProvenance(squib),
        })

        await loadAssignments()

        window.location.href = `/studio/intent/edit/id=${newAssignment._id};type=crackbackPost`
      } catch (err) {
        console.error("Promote to Assignment failed:", err)

        const message =
          err instanceof Error ? err.message : JSON.stringify(err, null, 2)

        setSquibsError(message)
      } finally {
        setPromotingSquibId(null)
      }
    },
    [client, loadAssignments]
  )

  const handlePublishThought = useCallback(
    async (squib: SquibDoc) => {
      try {
        setPublishingSquibId(squib._id)
        setSquibsError(null)

        const publishedId = getPublishedId(squib._id)
        const draftId = getDraftId(squib._id)

        const draftDoc = await client.getDocument(draftId)
        const publishedDoc = await client.getDocument(publishedId)
        const sourceDoc = draftDoc || publishedDoc

        if (!sourceDoc) {
          throw new Error("Thought document not found")
        }

        const cleanDoc = stripSystemFields({
          ...sourceDoc,
          _id: publishedId,
        })

        const tx = client.transaction().createOrReplace(cleanDoc)

        if (draftDoc?._id) {
          tx.delete(draftDoc._id)
        }

        await tx.commit()

        await loadSquibs()
      } catch (err) {
        console.error("Publish Thought failed:", err)

        const message =
          err instanceof Error ? err.message : JSON.stringify(err, null, 2)

        setSquibsError(message)
      } finally {
        setPublishingSquibId(null)
      }
    },
    [client, loadSquibs]
  )

  return (
    <Container width={7} padding={4}>
      <Stack space={5}>
        <Card padding={5} radius={3} shadow={1} border>
          <Stack space={4}>
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4}>
              <Box>
                <Text size={1} muted>
                  Writer cockpit
                </Text>
                <Heading size={3}>Notice → Think → Explore → Prove</Heading>
                <Text muted style={{display: "block", marginTop: 6, lineHeight: 1.4}}>
                  Signals become Thoughts. Thoughts become Assignments. Assignments become Crackbacks.
                </Text>
              </Box>

              <Flex gap={2} wrap="wrap">
                <Button text="New Signal" icon={AddIcon} tone="primary" />
                <Button text="New Thought" icon={BulbOutlineIcon} />
                <Button text="New Assignment" icon={DocumentsIcon} />
                <Button text="New Crackback" icon={ComposeIcon} />
              </Flex>
            </Flex>

            <Grid columns={[2, 2, 4]} gap={3}>
              <Card padding={3} radius={2} tone="primary">
                <Stack space={2}>
                  <Text size={1}>Signals loaded</Text>
                  <Heading size={4}>{signalCount}</Heading>
                </Stack>
              </Card>

              <Card padding={3} radius={2} tone="caution">
                <Stack space={2}>
                  <Text size={1}>Thoughts in motion</Text>
                  <Heading size={4}>{squibCount}</Heading>
                </Stack>
              </Card>

              <Card padding={3} radius={2} tone="positive">
                <Stack space={2}>
                  <Text size={1}>Active assignments</Text>
                  <Heading size={4}>{assignmentCount}</Heading>
                </Stack>
              </Card>

              <Card padding={3} radius={2}>
                <Stack space={2}>
                  <Text size={1}>Open crackbacks</Text>
                  <Heading size={4}>{crackbackCount}</Heading>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Card>

        <Grid columns={[1, 1, 3]} gap={4} style={{alignItems: "start"}}>
          <QueueShell
            title="Signals"
            subtitle="Live from Sanity"
            onRefresh={loadSignals}
          >
            {loading ? (
              <Flex align="center" gap={3}>
                <Spinner muted />
                <Text muted>Loading signals…</Text>
              </Flex>
            ) : error ? (
              <Card padding={3} radius={2} tone="critical">
                <Text size={1}>Error: {error}</Text>
              </Card>
            ) : signals.length === 0 ? (
              <Card padding={3} radius={2} border>
                <Text muted>No signals found.</Text>
              </Card>
            ) : (
              <Stack space={3}>
                {signals.map((signal) => (
                  <SignalRow
                    key={signal._id}
                    signal={signal}
                    onPromoteToThought={handlePromoteToThought}
                    onPublishSignal={handlePublishSignal}
                    isPromoting={promotingSignalId === signal._id}
                    isPublishing={publishingSignalId === signal._id}
                  />
                ))}
              </Stack>
            )}
          </QueueShell>

          <QueueShell
            title="Thoughts"
            subtitle="Live squibs from Sanity"
            onRefresh={loadSquibs}
          >
            {squibsLoading ? (
              <Flex align="center" gap={3}>
                <Spinner muted />
                <Text muted>Loading thoughts…</Text>
              </Flex>
            ) : squibsError ? (
              <Card padding={3} radius={2} tone="critical">
                <Text size={1}>Error: {squibsError}</Text>
              </Card>
            ) : squibs.length === 0 ? (
              <Card padding={3} radius={2} border>
                <Text muted>No thoughts found.</Text>
              </Card>
            ) : (
              <Stack space={3}>
                {squibs.map((squib) => (
                  <SquibRow
                    key={squib._id}
                    squib={squib}
                    onPromoteToAssignment={handlePromoteToAssignment}
                    onPublishThought={handlePublishThought}
                    isPromoting={promotingSquibId === squib._id}
                    isPublishing={publishingSquibId === squib._id}
                  />
                ))}
              </Stack>
            )}
          </QueueShell>

          <QueueShell
            title="Assignments"
            subtitle="Live crackback posts from Sanity"
            onRefresh={loadAssignments}
          >
            {assignmentsLoading ? (
              <Flex align="center" gap={3}>
                <Spinner muted />
                <Text muted>Loading assignments…</Text>
              </Flex>
            ) : assignmentsError ? (
              <Card padding={3} radius={2} tone="critical">
                <Text size={1}>Error: {assignmentsError}</Text>
              </Card>
            ) : assignments.length === 0 ? (
              <Card padding={3} radius={2} border>
                <Text muted>No assignments found.</Text>
              </Card>
            ) : (
              <Stack space={3}>
                {assignments.map((assignment) => (
                  <AssignmentRow key={assignment._id} assignment={assignment} />
                ))}
              </Stack>
            )}
          </QueueShell>
        </Grid>

        <QueueShell
          title="Crackbacks"
          subtitle="Live crackbacks from Sanity"
          onRefresh={loadCrackbacks}
        >
          {crackbacksLoading ? (
            <Flex align="center" gap={3}>
              <Spinner muted />
              <Text muted>Loading crackbacks…</Text>
            </Flex>
          ) : crackbacksError ? (
            <Card padding={3} radius={2} tone="critical">
              <Text size={1}>Error: {crackbacksError}</Text>
            </Card>
          ) : crackbacks.length === 0 ? (
            <Card padding={3} radius={2} border>
              <Text muted>No crackbacks found.</Text>
            </Card>
          ) : (
            <Grid columns={[1, 1, 2]} gap={3}>
              {crackbacks.map((crackback) => (
                <CrackbackRow key={crackback._id} crackback={crackback} />
              ))}
            </Grid>
          )}
        </QueueShell>
      </Stack>
    </Container>
  )
}
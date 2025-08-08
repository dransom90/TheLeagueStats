export interface LeagueData{
    draftDetail: DraftDetail
    gameId: number
    id: number
    members: Member[]
    schedule: Schedule[]
    scoringPeriodId: number
    seasonId: number
    segmentId: number
    status: Status
    teams: Team[]
}

export interface Team {
  abbrev: string
  currentProjectedRank: number
  divisionId: number
  draftDayProjectedRank: number
  id: number
  isActive: boolean
  logo: string
  logoType: string
  name: string
  owners: string[]
  playoffSeed: number
  points: number
  pointsAdjusted: number
  pointsDelta: number
  primaryOwner: string
  rankCalculatedFinal: number
  rankFinal: number
  record: Record
  roster: Roster
  transactionCounter: TransactionCounter
  //valuesByStat: ValuesByStat
  waiverRank: number
  autoPilotStatus?: AutoPilotStatus
}

export interface TransactionCounter {
  acquisitionBudgetSpent: number
  acquisitions: number
  drops: number
  matchupAcquisitionTotals: MatchupAcquisitionTotals
  misc: number
  moveToActive: number
  moveToIR: number
  paid: number
  teamCharges: number
  trades: number
}

export interface MatchupAcquisitionTotals {
  "2"?: number
  "3": number
  "6": number
  "8"?: number
  "9"?: number
  "10"?: number
  "11"?: number
  "12"?: number
  "14": number
  "16"?: number
  "17"?: number
  "4"?: number
  "5"?: number
  "7"?: number
  "13"?: number
  "15"?: number
}

export interface Roster {
  appliedStatTotal: number
  entries: Entry[]
}

export interface Record {
  away: Away
  division: Division
  home: Home
  overall: Overall
}

export interface Division {
  gamesBack: number
  losses: number
  percentage: number
  pointsAgainst: number
  pointsFor: number
  streakLength: number
  streakType: string
  ties: number
  wins: number
}

export interface Overall {
  gamesBack: number
  losses: number
  percentage: number
  pointsAgainst: number
  pointsFor: number
  streakLength: number
  streakType: string
  ties: number
  wins: number
}

export interface Status {
  activatedDate: number
  createdAsLeagueType: number
  currentLeagueType: number
  currentMatchupPeriod: number
  finalScoringPeriod: number
  firstScoringPeriod: number
  isActive: boolean
  isExpired: boolean
  isFull: boolean
  isPlayoffMatchupEdited: boolean
  isToBeDeleted: boolean
  isViewable: boolean
  isWaiverOrderEdited: boolean
  latestScoringPeriod: number
  previousSeasons: number[]
  standingsUpdateDate: number
  teamsJoined: number
  transactionScoringPeriod: number
  waiverLastExecutionDate: number
  //waiverProcessStatus: WaiverProcessStatus
}

export interface AutoPilotStatus {
  enabled: boolean
}

export interface DraftDetail {
  drafted: boolean
  inProgress: boolean
}

export interface Member {
  displayName: string
  firstName: string
  id: string
  lastName: string
  notificationSettings: NotificationSetting[]
}

export interface NotificationSetting {
  enabled: boolean
  id: string
  type: string
}

export interface Schedule {
  away?: Away
  home: Home
  id: number
  matchupPeriodId: number
  playoffTierType: string
  winner: string
}

export interface Away {
  adjustment: number
  cumulativeScore: CumulativeScore
  gamesPlayed: number
  pointsByScoringPeriod: PointsByScoringPeriod
  teamId: number
  tiebreak: number
  totalPoints: number
  totalPointsLive?: number
  rosterForCurrentScoringPeriod?: RosterForCurrentScoringPeriod
  rosterForMatchupPeriod?: RosterForMatchupPeriod
}

export interface Home {
  adjustment: number
  cumulativeScore: CumulativeScore
  gamesPlayed: number
  pointsByScoringPeriod: PointsByScoringPeriod
  teamId: number
  tiebreak: number
  totalPoints: number
  rosterForCurrentScoringPeriod?: RosterForCurrentScoringPeriod
  rosterForMatchupPeriod?: RosterForMatchupPeriod
  totalPointsLive?: number
}
export interface CumulativeScore {
  losses: number
  //scoreByStat: ScoreByStat
  //statBySlot: any
  ties: number
  wins: number
}

export interface PointsByScoringPeriod {
  [key: string]: number | undefined;
}

export interface RosterForCurrentScoringPeriod {
  appliedStatTotal: number
  entries: Entry[]
}

export interface Entry {
  acquisitionDate: any
  acquisitionType: any
  injuryStatus: string
  lineupSlotId: number
  pendingTransactionIds: any
  playerId: number
  playerPoolEntry: PlayerPoolEntry
  status: string
}

export interface PlayerPoolEntry {
  appliedStatTotal: number
  id: number
  keeperValue: number
  keeperValueFuture: number
  lineupLocked: boolean
  onTeamId: number
  player: Player
  rosterLocked: boolean
  status: string
  tradeLocked: boolean
}

export interface Player {
  active: boolean
  defaultPositionId: number
  droppable: boolean
  eligibleSlots: number[]
  firstName: string
  fullName: string
  id: number
  injured: boolean
  injuryStatus?: string
  lastName: string
  proTeamId: number
  stats: Stat[]
  universeId: number
}

export interface Stat {
  //appliedStats: AppliedStats
  appliedTotal: number
  externalId: string
  id: string
  proTeamId: number
  scoringPeriodId: number
  seasonId: number
  statSourceId: number
  statSplitTypeId: number
  //stats: Stats
  //variance?: Variance
}

export interface RosterForMatchupPeriod {
  appliedStatTotal: number
  entries: Entry[]
}
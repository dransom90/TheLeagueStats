import type {Player } from "./LeagueDataTypes";

export function getOptimalLineup (players: Player[], selectedWeek: number): Player[] {
    const FLEX_ELIGIBLE = [2, 4, 6]; // RB, WR, TE
    const lineup: Player[] = [];
    const counts: { [positionId: number]: number } = {};
    const usedPlayers: Set<number> = new Set();

    let copiedPlayers = [...players];

    // Get the QBs and add the highest scoring one
    const qbs = copiedPlayers.filter((p) => p.defaultPositionId === 1);
    if (qbs.length > 0) {
        const bestQB = qbs.reduce((prev, curr) => {
        const prevPoints =
            prev.stats.find((s) => s.scoringPeriodId === selectedWeek)
            ?.appliedTotal ?? 0;
        const currPoints =
            curr.stats.find((s) => s.scoringPeriodId === selectedWeek)
            ?.appliedTotal ?? 0;

        return prevPoints > currPoints ? prev : curr;
        });
        lineup.push(bestQB);
        usedPlayers.add(bestQB.id);
        counts[0] = (counts[0] || 0) + 1;
        copiedPlayers = copiedPlayers.filter((p) => p.id !== bestQB.id);
    }

    const rbs = copiedPlayers.filter((p) => p.defaultPositionId === 2);
    if (rbs.length > 0) {
        const sortedRbs = rbs.sort((a, b) => {
        const aPoints =
            a.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        const bPoints =
            b.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        return bPoints - aPoints;
        });
        for (let i = 0; i < Math.min(2, sortedRbs.length); i++) {
        const rb = sortedRbs[i];
        lineup.push(rb);
        usedPlayers.add(rb.id);
        counts[2] = (counts[2] || 0) + 1;
        copiedPlayers = copiedPlayers.filter((p) => p.id !== rb.id);
        }
    }

    const wrs = copiedPlayers.filter((p) => p.defaultPositionId === 4);
    if (wrs.length > 0) {
        const sortedWrs = wrs.sort((a, b) => {
        const aPoints =
            a.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        const bPoints =
            b.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        return bPoints - aPoints;
        });
        for (let i = 0; i < Math.min(2, sortedWrs.length); i++) {
        const wr = sortedWrs[i];
        lineup.push(wr);
        usedPlayers.add(wr.id);
        counts[4] = (counts[4] || 0) + 1;
        copiedPlayers = copiedPlayers.filter((p) => p.id !== wr.id);
        }
    }

    const tes = copiedPlayers.filter((p) => p.defaultPositionId === 6);
    if (tes.length > 0) {
        const sortedTes = tes.sort((a, b) => {
        const aPoints =
            a.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        const bPoints =
            b.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        return bPoints - aPoints;
        });
        const bestTE = sortedTes[0];
        lineup.push(bestTE);
        usedPlayers.add(bestTE.id);
        counts[6] = (counts[6] || 0) + 1;
        copiedPlayers = copiedPlayers.filter((p) => p.id !== bestTE.id);
    }

    const dsts = copiedPlayers.filter((p) => p.defaultPositionId === 16);
    if (dsts.length > 0) {
        const bestDST = dsts.reduce((prev, curr) => {
        const prevPoints =
            prev.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        const currPoints =
            curr.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        return prevPoints > currPoints ? prev : curr;
        });
        lineup.push(bestDST);
        usedPlayers.add(bestDST.id);
        counts[16] = (counts[16] || 0) + 1;
        copiedPlayers = copiedPlayers.filter((p) => p.id !== bestDST.id);
    }

    const k = copiedPlayers.filter((p) => p.defaultPositionId === 5);
    if (k.length > 0) {
        const bestK = k.reduce((prev, curr) => {
        const prevPoints =
            prev.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        const currPoints =
            curr.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        return prevPoints > currPoints ? prev : curr;
        });
        lineup.push(bestK);
        usedPlayers.add(bestK.id);
        counts[17] = (counts[17] || 0) + 1;
        copiedPlayers = copiedPlayers.filter((p) => p.id !== bestK.id);
    }

    // Add the highest remaining player to FLEX
    const flexCandidates = copiedPlayers.filter((p) =>
        FLEX_ELIGIBLE.includes(p.defaultPositionId)
    );
    if (flexCandidates.length > 0) {
        const bestFlex = flexCandidates.reduce((prev, curr) => {
        const prevPoints =
            prev.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        const currPoints =
            curr.stats.find(
            (s) =>
                s.scoringPeriodId === selectedWeek &&
                s.statSourceId === 0 &&
                s.statSplitTypeId === 1
            )?.appliedTotal ?? 0;
        return prevPoints > currPoints ? prev : curr;
        });
        lineup.push(bestFlex);
        usedPlayers.add(bestFlex.id);
        counts[23] = (counts[23] || 0) + 1;
    }
    return lineup;
};
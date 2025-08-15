export interface AwardRecipient {
    teamName: string,
    value: number
}

export interface WeekAwards{
    week: number;
    highestScore: AwardRecipient[];
    lowestScore: AwardRecipient[];
    highestPotential: AwardRecipient[];
    lowestPotential: AwardRecipient[];
    bestManaged: AwardRecipient[];
    worstManaged: AwardRecipient[];
    largestWin: AwardRecipient[];
    smallestWin: AwardRecipient[];
}
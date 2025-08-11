export type LuckPoints = {
    teamId: number;
    teamName: string;
    weekly: {
        week: number;
        points: number;
        won: boolean;
        luck: number;
    }[];
    totalLuck: number;
};

export interface TeamLuck{
    teamId: string;
    teamName: string;
    luckPoints: number[];
    totalLuck: number;
}